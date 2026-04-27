import { inject, Injectable } from '@angular/core';

// Interfaces
import { BookmarkedVerse, Verse } from '../interfaces/verse';

// Constants
import { storage } from '../constants/local-storage.constant';

// Services
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private localStorageService = inject(LocalStorageService);
  private readonly maxBookmarks: number = 30;

  bookmarks = this.localStorageService.getLocalStorageSignal<BookmarkedVerse[]>(
    storage.BOOKMARKS,
    [],
  );

  constructor(private toastService: ToastService) {}

  addBookmark(selectedVerse: Verse): void {
    if (!selectedVerse) {
      return;
    }

    if (this.bookmarks().length >= this.maxBookmarks) {
      return;
    }

    const { book, chapter, verse } = selectedVerse || {};
    const exists = this.bookmarks().some(
      (item) => item.book === book && +item.chapter === +chapter && +item.verse === +verse,
    );

    if (!exists) {
      const newBookmark: BookmarkedVerse[] = [
        {
          ...selectedVerse,
          dateAdded: new Date().toISOString(),
        },
        ...this.bookmarks(),
      ];

      this.localStorageService.updateLocalStorageSignal(storage.BOOKMARKS, newBookmark);
      this.toastService.success(`${book} ${chapter}:${verse}`, `has been added to bookmarks.`);
    }
  }

  removeBookmarked(selectedVerse: Verse): void {
    if (!selectedVerse) {
      return;
    }

    const updatedBookmarked = this.bookmarks().filter(
      (item) =>
        !(
          item.book === selectedVerse.book &&
          item.chapter === selectedVerse.chapter &&
          item.verse === selectedVerse.verse
        ),
    );
    this.localStorageService.updateLocalStorageSignal(
      storage.BOOKMARKS,
      updatedBookmarked,
    );
  }
}
