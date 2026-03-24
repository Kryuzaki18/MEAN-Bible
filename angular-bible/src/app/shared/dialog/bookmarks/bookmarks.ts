import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces
import { Verse } from '../../interfaces/verse';

// Services
import { BookmarkService } from '../../services/bookmark.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-bookmarks',
  imports: [FormsModule, ButtonModule, CardModule],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.scss',
  standalone: true,
})
export class Bookmarks implements OnInit {
  bookmarks = signal<Verse[]>([]);

  constructor(
    public ref: DynamicDialogRef,
    private router: Router,
    private bookmarkService: BookmarkService,
  ) {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  removeBookmark(verse: Verse | null): void {
    this.bookmarkService.removeBookmark(verse);
    this.loadBookmarks();
  }

  navigateBookmark(bookmark: Verse): void {
    this.router.navigate(['/home'], {
      queryParams: { book: bookmark.book, chapter: bookmark.chapter },
    });
    this.ref.close();
  }

  copyVerse(bookmark: Verse): void {
    if (bookmark) {
      const verseText = `${bookmark.book} ${bookmark.chapter}:${bookmark.verse} - ${bookmark.text}`;
      navigator.clipboard
        .writeText(verseText)
        .then(() => {
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
