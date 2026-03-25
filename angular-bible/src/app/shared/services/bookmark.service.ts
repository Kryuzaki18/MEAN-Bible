import { Injectable, signal } from '@angular/core';

// Interfaces
import { BookmarkedVerse, Verse } from '../interfaces/verse';

// Constants
import { LocalStorageKeys } from '../constants/local-storage.constant';

// Services
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  maxBookmarks: number = 30;

  private bookmarksCount = signal<number>(0);

  constructor(
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
  ) {
    this.updateBookmarksCount(this.getAllBookmarks().length);
  }

  getAllBookmarks(): BookmarkedVerse[] {
    const storedBookmarks = this.localStorageService.getLocalStorageItem<BookmarkedVerse[]>(
      LocalStorageKeys.BOOKMARKS,
      [],
    );
    return storedBookmarks;
  }

  addBookmark(selectedVerse: Verse): void {
    if (!selectedVerse) {
      console.warn('No verse selected to bookmark.');
      return;
    }

    let allBookmarked: BookmarkedVerse[] = this.getAllBookmarks();

    if (allBookmarked.length >= this.maxBookmarks) {
      return;
    }

    const { book, chapter, verse, text } = selectedVerse || {};
    const exists = allBookmarked.some(
      (item) => item.book === book && item.chapter === chapter && item.verse === verse,
    );

    if (!exists) {
      const newVerse = { book, chapter, verse, text };
      allBookmarked.push({
        ...newVerse,
        dateAdded: new Date().toISOString(),
      });

      this.localStorageService.setLocalStorageItem(LocalStorageKeys.BOOKMARKS, allBookmarked);
      this.updateBookmarksCount(allBookmarked.length);

      this.toastService.success(
        `${book} ${chapter}:${verse}`,
        `has been added to bookmarks.`,
      );
    } else {
      console.log('Verse already bookmarked');
    }
  }

  removeBookmarked(selectedVerse: Verse): void {
    if (!selectedVerse) {
      console.warn('No verse selected to remove from bookmarks.');
      return;
    }

    let allBookmarked: BookmarkedVerse[] = this.getAllBookmarks();

    const updatedBookmarked = allBookmarked.filter(
      (item) =>
        !(
          item.book === selectedVerse.book &&
          item.chapter === selectedVerse.chapter &&
          item.verse === selectedVerse.verse
        ),
    );

    this.localStorageService.setLocalStorageItem(LocalStorageKeys.BOOKMARKS, updatedBookmarked);
    this.updateBookmarksCount(updatedBookmarked.length);
  }

  getBookmarksCount(): number {
    return this.bookmarksCount();
  }

  private updateBookmarksCount(count: number): void {
    this.bookmarksCount.set(count);
  }
}
