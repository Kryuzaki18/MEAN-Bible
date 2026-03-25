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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

interface IChapter {
  label: string;
  chapter: number;
}

@Component({
  selector: 'app-main',
  imports: [
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
  @ViewChild('popoverVerse') popoverVerse!: Popover;
  route = inject(ActivatedRoute);

  searchControl = new FormControl('');

  chapters = signal<IChapter[]>([]);
  selectedChapter = signal<number>(1);
  initialVerses: Verse[] = [];
  verses = signal<Verse[]>([]);
  bookDetails = signal<Book>({} as Book);
  selectedVerse = signal<Verse | null>(null);
  queryParams = toSignal(this.route.queryParamMap);

  book = computed(() => this.queryParams()?.get('book') ?? 'Genesis');
  isFirstChapter = computed(() => this.selectedChapter() === 1);
  isLastChapter = computed(() => this.selectedChapter() === this.chapters().length);

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private bibleService: BibleService,
    private localStorageService: LocalStorageService,
    private bookmarkService: BookmarkService,
  ) {
    effect(() => {
      if (this.selectedChapter() > this.bookDetails().chapters) {
        this.selectedChapter.set(this.bookDetails().chapters);
      }

      this.getChapter(this.book(), this.selectedChapter());
      this.getBookDetails(this.book());
      this.selectedVerse.set(null);
    });
  }

  ngOnInit(): void {
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

  openPopoverVerseAction(event: MouseEvent, verse: Verse, target: HTMLElement): void {
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

  private getChapter(book: string, chapter: number): void {
    this.bibleService
      .getChapter(book, chapter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.initialVerses = data;
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

            this.chapters.set(
              Array.from({ length: foundBook.chapters }, (_, i) => ({
                chapter: i + 1,
                label: `Chapter ${i + 1}`,
              })),
            );
          } else {
            console.warn(`Book "${book}" not found in the list.`);
          }
        },
        error: (err) => console.error(err.message),
      });
  }
}
