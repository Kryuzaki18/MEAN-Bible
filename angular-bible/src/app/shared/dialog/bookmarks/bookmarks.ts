import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';

// Interfaces
import { BookmarkedVerse, Verse } from '../../interfaces/verse';

// Services
import { BookmarkService } from '../../services/bookmark.service';
import { ToastService } from '../../services/toast.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

// Pipes
import { SortedDatesPipe } from '../../pipes/sorted-dates.pipes';

@Component({
  selector: 'app-bookmarks',
  imports: [FormsModule, ButtonModule, CardModule, DatePipe, LowerCasePipe, SortedDatesPipe],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.scss',
  standalone: true,
})
export class Bookmarks {
  private bookmarkService = inject(BookmarkService);

  bookmarks = this.bookmarkService.bookmarks;
  selectedCopyVerse = signal<Verse | null>(null);

  constructor(
    public ref: DynamicDialogRef,
    private router: Router,
    private toastService: ToastService,
  ) {}

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
