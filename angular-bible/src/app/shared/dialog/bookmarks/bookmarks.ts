import { Component, signal, OnInit, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';

// Interfaces
import { BookmarkedVerse, Verse } from '../../interfaces/verse';

// Services
import { BookmarkService } from '../../services/bookmark.service';

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
export class Bookmarks implements OnInit {
  bookmarks = signal<BookmarkedVerse[]>([]);
  bookmarkCount: number = 0;
  selectedCopyVerse = signal<Verse | null>(null);

  constructor(
    public ref: DynamicDialogRef,
    private router: Router,
    private bookmarkService: BookmarkService,
  ) {
    effect(() => {
      this.bookmarkCount = this.bookmarkService.bookmarksCount();
    });
  }

  ngOnInit(): void {
    this.loadBookmarks();
  }

  removeBookmark(verse: BookmarkedVerse | null): void {
    if (!verse) {
      return;
    }

    this.bookmarkService.removeBookmark(verse);
    this.loadBookmarks();

    if (this.bookmarkService.bookmarksCount() === 0) {
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
          console.log('Verse copied to clipboard:', verseText);
        })
        .catch((err) => {
          console.error('Failed to copy verse:', err);
        });
    }
  }

  private loadBookmarks(): void {
    const storedBookmarks = this.bookmarkService.getAllBookmarks();
    this.bookmarks.set(storedBookmarks);
  }
}
