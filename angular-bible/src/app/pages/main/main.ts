import { Component, computed, DestroyRef, effect, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

// Common Components
import { Sidebar } from '../../commons/sidebar/sidebar';
import { Header } from '../../commons/header/header';

// Interfaces
import { Verse } from '../../shared/interfaces/verse';
import { Book } from '../../shared/interfaces/book';

// Constants
import { LocalStorageKeys } from '../../shared/constants/local-storage.constant';

// Services
import { BibleService } from '../../shared/services/bible.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { BookmarkService } from '../../shared/services/bookmark.service';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-main',
  imports: [
    FormsModule,
    Header,
    Sidebar,
    InputTextModule,
    ButtonModule,
    SelectModule,
    ScrollPanelModule,
    ScrollTopModule,
    PopoverModule,
    TooltipModule,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  standalone: true,
})
export class Main {
  @ViewChild('popoverVerse') popoverVerse!: Popover;

  verses = signal<Verse[]>([]);
  bookDetails = signal<Book>({} as Book);
  selectedVerse = signal<Verse | null>(null);
  route = inject(ActivatedRoute);
  queryParams = toSignal(this.route.queryParamMap);

  book = computed(() => this.queryParams()?.get('book') ?? 'Genesis');
  currentChapter = computed(() => Number(this.queryParams()?.get('chapter')) ?? 1);
  isFirstChapter = computed(() => this.currentChapter() === 1);

  private destroyRef = inject(DestroyRef);

  constructor(
    private bibleService: BibleService,
    private localStorageService: LocalStorageService,
    private bookmarkService: BookmarkService,
  ) {
    effect(() => {
      if (this.book() && this.currentChapter()) {
        this.getChapter(this.book(), this.currentChapter());
        this.getBookDetails(this.book());
        this.selectedVerse.set(null);
      }
    });
  }

  openPopoverVerseAction(event: MouseEvent, verse: Verse, target: HTMLElement) {
    this.selectedVerse.set(verse);
    this.popoverVerse.show(event, target);
    this.popoverVerse.hide();
    setTimeout(() => {
      this.popoverVerse.show(event, target);
    });
  }

  isBookmarked(verse: Verse | null): boolean {
    if (!verse) {
      return false;
    }
    const exists = this.localStorageService.getLocalStorageItem<any[]>(
      LocalStorageKeys.BOOKMARKS,
      [],
    );
    return exists.some(
      (item) =>
        item.book === verse.book && item.chapter === verse.chapter && item.verse === verse.verse,
    );
  }

  addBookmark(): void {
   this.bookmarkService.addBookmark(this.selectedVerse());
  }

  removeBookmark(): void {
    this.bookmarkService.removeBookmark(this.selectedVerse());
  }

  copyVerse(): void {
    const verse = this.selectedVerse();
    if (verse) {
      const verseText = `${verse.book} ${verse.chapter}:${verse.verse} - ${verse.text}`;
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
 
  private getChapter(book: string, chapter: number): void {
    this.bibleService
      .getChapter(book, chapter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.verses.set(data);
      });
  }

  private getBookDetails(book: string): void {
    this.bibleService
      .getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const foundBook = data.find((b) => b.name === book);
          if (foundBook) {
            this.bookDetails.set(foundBook);
          } else {
            console.warn(`Book "${book}" not found in the list.`);
          }
        },
        error: (err) => console.error(err.message),
      });
  }
}
