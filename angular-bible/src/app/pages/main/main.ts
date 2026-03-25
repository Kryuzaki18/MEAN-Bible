import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Common Components
import { Sidebar } from '../../commons/sidebar/sidebar';
import { Header } from '../../commons/header/header';

// Pipes
import { HighlightPipe } from '../../shared/pipes/highlight.pipes';

// Interfaces
import { Verse } from '../../shared/interfaces/verse';
import { Book } from '../../shared/interfaces/book';

// Services
import { BibleService } from '../../shared/services/bible.service';
import { BookmarkService } from '../../shared/services/bookmark.service';
import { ToastService } from '../../shared/services/toast.service';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

interface IChapter {
  label: string;
  chapter: number;
}

@Component({
  selector: 'app-main',
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    Header,
    Sidebar,
    InputTextModule,
    ButtonModule,
    SelectModule,
    ScrollPanelModule,
    ScrollTopModule,
    PopoverModule,
    TooltipModule,
    HighlightPipe,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  standalone: true,
})
export class Main implements OnInit {
  @ViewChild('popoverVerseActions') popoverVerseActions!: Popover;
  route = inject(ActivatedRoute);

  searchControl = new FormControl('');

  defaultBook: string = 'Genesis';

  allBooks = signal<Book[]>([]);
  chapters = signal<IChapter[]>([]);
  selectedChapter = signal<number>(1);
  initialVerses: Verse[] = [];
  verses = signal<Verse[]>([]);
  bookDetails = signal<Book>({} as Book);
  selectedVerse = signal<Verse>({} as Verse);
  queryParams = toSignal(this.route.queryParamMap);

  book = computed(() => {
    const newBook = this.queryParams()?.get('book');
    const bookFound = this.allBooks().find((b) => b.name.toLowerCase() === newBook?.toLowerCase());
    if (!newBook || !bookFound) {
      return this.defaultBook;
    }

    return bookFound.name;
  });
  isFirstChapter = computed(() => this.selectedChapter() === 1);
  isLastChapter = computed(() => this.selectedChapter() === this.chapters().length);

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private bibleService: BibleService,
    private bookmarkService: BookmarkService,
    private toastService: ToastService,
  ) {
    effect(() => {
      const bookName = this.book();
      const allBooks = this.allBooks();
      const selectedChapter = this.selectedChapter();

      const foundBook = allBooks.find((b) => b.name === bookName);

      if (!foundBook) return;

      this.bookDetails.set(foundBook);

      const totalChapters = foundBook.chapters;
      this.chapters.set(
        Array.from({ length: totalChapters }, (_, i) => ({
          chapter: i + 1,
          label: `Chapter ${i + 1}`,
        })),
      );

      const safeChapter = Math.min(selectedChapter, totalChapters);
      if (safeChapter !== selectedChapter) {
        this.selectedChapter.set(safeChapter);
      }

      this.selectedVerse.set({} as Verse);

      if (bookName && safeChapter) {
        this.getAllVersesByChapter(bookName, safeChapter);
      }
    });
  }

  ngOnInit(): void {
    this.fetchBooks();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = parseInt(params.get('chapter') ?? '1', 10);
      this.selectedChapter.set(isNaN(raw) || raw < 1 ? 1 : raw);
      this.clearSearch();
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.onSearch(value ?? '');
      });
  }

  openPopoverVerseActions(event: MouseEvent, verse: Verse, target: HTMLElement): void {
    this.selectedVerse.set(verse);
    this.popoverVerseActions.show(event, target);
    this.popoverVerseActions.hide();
    setTimeout(() => {
      this.popoverVerseActions.show(event, target);
    });
  }

  isBookmarked(verse: Verse): boolean {
    return !!this.bookmarkService
      .getAllBookmarks()
      .find(
        (item) =>
          item.book === verse.book && item.chapter === verse.chapter && item.verse === verse.verse,
      );
  }

  addBookmark(): void {
    this.bookmarkService.addBookmark(this.selectedVerse());
  }

  removeBookmarked(): void {
    this.bookmarkService.removeBookmarked(this.selectedVerse());
  }

  copyVerse(): void {
    const verse = this.selectedVerse();
    if (verse) {
      const verseText = `${verse.book} ${verse.chapter}:${verse.verse} - ${verse.text}`;
      navigator.clipboard
        .writeText(verseText)
        .then(() => {
          this.toastService.info(
            `${verse.book} ${verse.chapter}:${verse.verse}`,
            `has been copied to clipboard.`,
          );
        })
        .catch((err) => {
          console.error('Failed to copy verse:', err);
        });
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  previousChapter(): void {
    if (!this.isFirstChapter()) {
      this.clearSearch();
      this.selectedChapter.update((chapter) => chapter - 1);
      this.selectChapter(this.selectedChapter());
    }
  }

  nextChapter(): void {
    const chaptersCount = this.chapters().length;
    if (this.selectedChapter() < chaptersCount) {
      this.clearSearch();
      this.selectedChapter.update((chapter) => chapter + 1);
      this.selectChapter(this.selectedChapter());
    }
  }

  selectChapter(chapter: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { chapter },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private onSearch(query: string): void {
    const searchQuery = query.trim().toLowerCase();
    const data = this.verses().filter((verse) => verse.text.toLowerCase().includes(searchQuery));
    if (searchQuery.length <= 1 || data.length === 0) {
      this.verses.set(this.initialVerses);
      return;
    }
    this.verses.set(data);
  }

  private getAllVersesByChapter(book: string, chapter: number): void {
    this.bibleService
      .getChapter(book, chapter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.initialVerses = data;
        this.verses.set(data);
      });
  }

  private fetchBooks(): void {
    this.bibleService
      .getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allBooks.set(data);
        },
        error: (err) => console.error(err.message),
      });
  }
}
