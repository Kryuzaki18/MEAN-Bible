import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';

// Interfaces
import { BookmarkedVerse, Verse } from '../../interfaces/verse';

// Pipes
import { SortedDatesPipe } from '../../pipes/sorted-dates.pipes';

// Services
import { BookmarkService } from '../../services/bookmark.service';
import { ToastService } from '../../services/toast.service';
import { AppSettingsService } from '../../services/app-settings.service';

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
    ButtonModule,
    CardModule,
    DatePipe,
    LowerCasePipe,
    SortedDatesPipe,
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly ref = inject(DynamicDialogRef);

  readonly bookmarks = this.bookmarkService.bookmarks;
  readonly selectedCopyVerse = signal<Verse | null>(null);

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
}
