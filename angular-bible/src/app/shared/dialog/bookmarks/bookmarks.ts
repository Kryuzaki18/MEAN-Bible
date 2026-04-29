import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  readonly ref = inject(DynamicDialogRef);

  readonly bookmarks = this.bookmarkService.bookmarks;
  readonly selectedCopyVerse = signal<Verse | null>(null);

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
    this.router.navigate(['/home'], {
      queryParams: { book: bookmark.book, chapter: bookmark.chapter },
    });

     const lastRead = {
      book: bookmark.book,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
    };

    this.appSettings.setLastRead(lastRead);
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
