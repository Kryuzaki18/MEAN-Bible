import { Injectable, signal } from '@angular/core';

// Interfaces
import { BookmarkedVerse, Verse } from '../interfaces/verse';

// Constants
import { LocalStorageKeys } from '../constants/local-storage.constant';

// Services
import { LocalStorageService } from '../../shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  maxBookmarks: number = 30;
  bookmarksCount = signal<number>(0);

  constructor(private localStorageService: LocalStorageService) {
    this.bookmarksCount.set(this.getAllBookmarks().length);
  }

  getAllBookmarks(): Verse[] {
    const storedBookmarks = this.localStorageService.getLocalStorageItem<Verse[]>(
      LocalStorageKeys.BOOKMARKS,
      [],
    );
    return storedBookmarks;
  }

  addBookmark(selectedVerse: Verse | null): void {
    if (!selectedVerse) {
      console.warn('No verse selected to bookmark.');
      return;
    }

    let existingData: BookmarkedVerse[] = this.getAllBookmarks();

    if (existingData.length >= this.maxBookmarks) {
      return;
    }

    const { book, chapter, verse, text } = selectedVerse || {};
    const exists = existingData.some(
      (item) => item.book === book && item.chapter === chapter && item.verse === verse,
    );

    if (!exists) {
      const newVerse = { book, chapter, verse, text };
      existingData.push({
        ...newVerse,
        dateAdded: new Date().toISOString(),
      });

      this.localStorageService.setLocalStorageItem(LocalStorageKeys.BOOKMARKS, existingData);
      this.bookmarksCount.set(existingData.length);
    } else {
      console.log('Verse already bookmarked');
    }
  }

  removeBookmark(selectedVerse: Verse | null): void {
    if (!selectedVerse) {
      console.warn('No verse selected to remove from bookmarks.');
      return;
    }

    let existingData = this.getAllBookmarks();

    const updatedData = existingData.filter(
      (item) =>
        !(
          item.book === selectedVerse.book &&
          item.chapter === selectedVerse.chapter &&
          item.verse === selectedVerse.verse
        ),
    );

    this.localStorageService.setLocalStorageItem(LocalStorageKeys.BOOKMARKS, updatedData);
    this.bookmarksCount.set(updatedData.length);
  }
}
