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
import { DrawerModule } from 'primeng/drawer';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

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
    DrawerModule,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  standalone: true,
})
export class Main implements OnInit {
  appSettings = inject(AppSettingsService);

  @ViewChild('popoverVerseActions') popoverVerseActions!: Popover;
  route = inject(ActivatedRoute);

  searchControl = new FormControl('');

  defaultBook: string = 'Genesis';

  allBooks = signal<Book[]>([]);
  selectedChapter = signal<number>(1);
  initialVerses: Verse[] = [];
  verses = signal<Verse[]>([]);
  selectedVerse = signal<Verse>({} as Verse);
  queryParams = toSignal(this.route.queryParamMap);

  isFirstChapter = computed(() => this.selectedChapter() === 1);
  isLastChapter = computed(() => this.selectedChapter() === this.chapters().length);

  selectedBook = computed(() => {
    const newBook = this.queryParams()?.get('book') || this.defaultBook;
    return this.allBooks().find((b) => b.name.toLowerCase() === newBook.toLowerCase());
  });

  chapters = computed(() => {
    const book = this.selectedBook();
    const totalChapters = book?.chapters;
    if (totalChapters) {
      return Array.from({ length: totalChapters }, (_, i) => ({
        chapter: i + 1,
        label: `Chapter ${i + 1}`,
      }));
    }
    return [];
  });

  isBookmarked = computed(() => {
    const bookmarks = this.bookmarkService.bookmarks();
    const isBookmarked = bookmarks.find(
      (item) =>
        item.book === this.selectedVerse().book &&
        +item.chapter === +this.selectedVerse().chapter &&
        +item.verse === +this.selectedVerse().verse
    );

    return !!isBookmarked;
  });

  bookmarkService = inject(BookmarkService);
  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private bibleService: BibleService,
    private toastService: ToastService,
  ) {
    effect(() => {
      const book = this.selectedBook();
      const selectedChapter = this.selectedChapter();
      if (book?.name && selectedChapter) {
        this.getAllVersesByChapter(book.name, selectedChapter);
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
    const isSameVerse = this.selectedVerse()?.verse === verse.verse;

    if (isSameVerse) {
      this.popoverVerseActions.toggle(event, target);
    } else {
      this.popoverVerseActions.hide();
      this.selectedVerse.set(verse);

      setTimeout(() => {
        this.popoverVerseActions.show(event, target);
      }, 0);
    }
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
