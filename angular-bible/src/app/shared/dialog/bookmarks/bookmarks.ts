import { Component, signal, inject, computed, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, take } from 'rxjs';

// Interfaces
import { BookmarkedVerse, Verse } from '../../interfaces/verse';

// Pipes
import { SortedDatesPipe } from '../../pipes/sorted-dates.pipes';

// Services
import { BookmarkService } from '../../services/bookmark.service';
import { ToastService } from '../../services/toast.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { AudioService } from '../../services/audi.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-bookmarks',
  imports: [
    FormsModule,
    NgClass,
    DatePipe,
    LowerCasePipe,
    SortedDatesPipe,
    ButtonModule,
    CardModule,
    ScrollPanelModule,
    TooltipModule,
    SelectButtonModule,
  ],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.scss',
  standalone: true,
})
export class Bookmarks {
  private readonly bookmarkService = inject(BookmarkService);
  private readonly appSettings = inject(AppSettingsService);
  private readonly toastService = inject(ToastService);
  private readonly audioService = inject(AudioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly ref = inject(DynamicDialogRef);
  private destroyRef = inject(DestroyRef);

  readonly bookmarks = this.bookmarkService.bookmarks;
  readonly selectedCopyVerse = signal<Verse | null>(null);
  readonly selectedAudioVerse = signal<Verse | null>(null);
  readonly isAudioLoading = signal<boolean>(false);
  readonly testament = signal<number>(0);

  readonly filteredBookmarks = computed(() => {
    const oldTestament = this.bookmarks().filter((book) => book.testament.toLowerCase() === 'old');
    const newTestament = this.bookmarks().filter((book) => book.testament.toLowerCase() === 'new');

    if (this.testament() === 0) {
      return oldTestament;
    }
    return newTestament;
  });

  readonly testaments = computed<{ label: string; value: number }[]>(() => {
    const oldTestament = this.bookmarks().filter((book) => book.testament.toLowerCase() === 'old');
    const newTestament = this.bookmarks().filter((book) => book.testament.toLowerCase() === 'new');

    return [
      { label: `Old (${oldTestament.length})`, value: 0 },
      { label: `New (${newTestament.length})`, value: 1 },
    ];
  });

  isSelectedCopyVerse(bookmark: BookmarkedVerse): boolean {
    return (
      this.selectedCopyVerse()?.book === bookmark.book &&
      this.selectedCopyVerse()?.chapter === bookmark.chapter &&
      this.selectedCopyVerse()?.verse === bookmark.verse
    );
  }

  isPlayingAudio(bookmark: BookmarkedVerse): boolean {
    return (
      this.selectedAudioVerse()?.book === bookmark.book &&
      this.selectedAudioVerse()?.chapter === bookmark.chapter &&
      this.selectedAudioVerse()?.verse === bookmark.verse
    );
  }

  updateTestament(testament: number): void {
    this.testament.set(testament);
  }

  removeBookmarked(verse: BookmarkedVerse): void {
    if (!verse) {
      return;
    }

    this.bookmarkService.removeBookmarked(verse);

    if (this.bookmarks().length === 0) {
      this.ref.close();
    }
  }

  navigateBookmark(bookmark: BookmarkedVerse): void {
    const lastRead = {
      book: bookmark.book,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
    };

    this.appSettings.setLastRead(lastRead);

    this.router.navigate(['/home'], {
      relativeTo: this.route,
      queryParams: lastRead,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.ref.close();
  }

  copyVerse(bookmark: BookmarkedVerse): void {
    if (bookmark) {
      const verseText = `${bookmark.book} ${bookmark.chapter}:${bookmark.verse} - ${bookmark.text}`;
      navigator.clipboard
        .writeText(verseText)
        .then(() => {
          this.selectedCopyVerse.set(bookmark);
          this.toastService.info(
            `${bookmark.book} ${bookmark.chapter}:${bookmark.verse}`,
            `has been copied to clipboard.`,
          );
        })
        .catch((err) => {
          console.error('Failed to copy verse:', err);
        });
    }
  }

  audio(bookmark: BookmarkedVerse): void {
    if (this.isAudioLoading()) {
      return;
    }

    this.isAudioLoading.set(true);
    this.selectedAudioVerse.set(bookmark);

    const payload = {
      book: bookmark.book,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
    };

    this.audioService
      .getAudio(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          const cleanup = () => {
            URL.revokeObjectURL(url);
            this.isAudioLoading.set(false);
          };

          fromEvent(audio, 'loadedmetadata')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => audio.play());

          fromEvent(audio, 'ended')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => cleanup());

          fromEvent(audio, 'error')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.toastService.error('Audio playback failed');
              cleanup();
            });
        },
        error: (err) => {
          this.toastService.error(err.message);
          this.isAudioLoading.set(false);
        },
      });
  }
}
