import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
    private bookmarkService: BookmarkService,
    public ref: DynamicDialogRef,
  ) {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    const storedBookmarks = this.bookmarkService.getAllBookmarks();
    this.bookmarks.set(storedBookmarks);
  }

  removeBookmark(verse: Verse | null): void {
    this.bookmarkService.removeBookmark(verse);
    this.loadBookmarks();
  }
}
