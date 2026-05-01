import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, skip, take, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

// Common Components
import { Sidebar } from '../../commons/sidebar/sidebar';
import { Header } from '../../commons/header/header';

// Pipes
import { HighlightPipe } from '../../shared/pipes/highlight.pipes';

// Constants
import { storage } from '../../shared/constants/local-storage.constant';
import { defaultBook } from '../../shared/constants/bible.constant';

// Interfaces
import { Verse } from '../../shared/interfaces/verse';
import { Book, LastRead } from '../../shared/interfaces/book';

// Services
import { BibleService } from '../../shared/services/bible.service';
import { BookmarkService } from '../../shared/services/bookmark.service';
import { ToastService } from '../../shared/services/toast.service';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { AudioService } from '../../shared/services/audi.service';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DrawerModule } from 'primeng/drawer';

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
  private readonly router = inject(Router);
  private readonly bibleService = inject(BibleService);
  private readonly audioService = inject(AudioService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  readonly appSettings = inject(AppSettingsService);
  readonly bookmarkService = inject(BookmarkService);
  readonly localStorageService = inject(LocalStorageService);
  private destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  @ViewChild('popoverVerseActions') popoverVerseActions!: Popover;
  @ViewChildren('versesList') versesList!: QueryList<ElementRef>;

  readonly searchControl = new FormControl('');

  private readonly isFirstLoad = signal<boolean>(true);
  readonly isSubHeaderVisible = signal<boolean>(true);
  readonly isLoading = signal<boolean>(true);
  readonly isAudioPlaying = signal<boolean>(false);
  readonly isAudioAllPlaying = signal<boolean>(false);
  readonly allBooks = signal<Book[]>([]);
  readonly selectedChapter = signal<number>(1);
  readonly verses = signal<Verse[]>([]);
  readonly selectedVerse = signal<Verse | null>(null);
  readonly queryParams = toSignal(this.route.queryParamMap);
  readonly selectedAudioVerse = signal<Verse | null>(null);

  private initialVerses: Verse[] = [];

  private readonly lastRead = this.localStorageService.getLocalStorageSignal<LastRead>(
    storage.LAST_READ,
    { book: defaultBook, chapter: this.selectedChapter(), verse: 1, date: new Date() },
  );

  readonly isFirstChapter = computed(() => this.selectedChapter() === 1);
  readonly isLastChapter = computed(() => this.selectedChapter() === this.chapters().length);

  readonly paramsBook = computed(() => {
    const newBook = this.queryParams()?.get('book');
    return this.allBooks().find((b) => b.name.toLowerCase() === newBook?.toLowerCase());
  });

  readonly paramsChapter = computed(() => {
    if (!this.paramsBook()) return 0;
    const chapter = parseInt(this.queryParams()?.get('chapter') ?? '0');
    const maxChapter = this.paramsBook()?.chapters || 0;
    return isNaN(chapter) || chapter < 1 ? 0 : chapter > maxChapter ? 0 : chapter;
  });

  readonly paramsVerse = computed(() => {
    if (!this.paramsBook()) return 0;
    const verse = parseInt(this.queryParams()?.get('verse') ?? '0');
    const maxVerse = this.paramsBook()?.verses || 0;
    return isNaN(verse) || verse < 1 ? 0 : verse > maxVerse ? 0 : verse;
  });

  readonly chapters = computed(() => {
    const book = this.paramsBook();
    const totalChapters = book?.chapters;
    if (totalChapters) {
      return Array.from({ length: totalChapters }, (_, i) => ({
        chapter: i + 1,
        label: `Chapter ${i + 1}`,
      }));
    }
    return [];
  });

  readonly isBookmarked = computed(() => {
    if (!this.selectedVerse()) return false;
    const bookmarks = this.bookmarkService.bookmarks();
    const isBookmarked = bookmarks.find(
      (item) =>
        item.book === this.selectedVerse()!.book &&
        +item.chapter === +this.selectedVerse()!.chapter &&
        +item.verse === +this.selectedVerse()!.verse,
    );

    return !!isBookmarked;
  });

  ngOnInit(): void {
    this.fetchBooks();

    this.route.queryParamMap
      .pipe(
        tap(() => this.isLoading.set(true)),
        takeUntilDestroyed(this.destroyRef),
        debounceTime(100),
      )
      .subscribe((params) => {
        this.clearSearch();
        const lastRead = this.lastRead();
        this.selectedVerse.set(null);

        if (
          this.isFirstLoad() &&
          !this.paramsBook() &&
          !this.paramsChapter() &&
          !this.paramsVerse() &&
          lastRead
        ) {
          delete lastRead.date;
          this.router.navigate(['/home'], {
            relativeTo: this.route,
            queryParams: lastRead,
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          this.selectedChapter.set(lastRead.chapter);
          this.getAllVersesByChapter(lastRead.book, lastRead.chapter);
          this.scrollToVerse(lastRead.verse);
        } else {
          const book = this.paramsBook()?.name ?? defaultBook;
          const chapter = this.paramsChapter() || 1;
          this.router.navigate(['/home'], {
            relativeTo: this.route,
            queryParams: {
              book,
              chapter,
              verse: this.paramsVerse() || 1,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          this.selectedChapter.set(chapter);
          this.getAllVersesByChapter(book, chapter);
          this.scrollToVerse(this.paramsVerse());
        }
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.onSearch(value ?? '');
      });
  }

  scrollToVerse(verse: number): void {
    toObservable(this.verses, { injector: this.injector })
      .pipe(
        skip(1),
        filter((verses) => verses.length > 0),
        take(1),
      )
      .subscribe((verses) => {
        const index = verses.findIndex((v) => v.verse === verse);
        if (index === -1) return;
        this.isLoading.set(false);

        requestAnimationFrame(() => {
          const verseEl = this.versesList.get(index);
          if (!verseEl) return;

          const el = verseEl.nativeElement;

          const scrollContainer = el.closest('.p-scrollpanel-content') as HTMLElement;
          if (!scrollContainer) return;

          const offset = el.offsetTop - scrollContainer.offsetTop - 8;

          scrollContainer.scrollTo({
            top: offset,
            behavior: 'smooth',
          });
        });
      });
  }

  openPopoverVerseActions(event: MouseEvent, verse: Verse, target: HTMLElement): void {
    const isSameVerse = this.selectedVerse()?.verse === verse.verse;

    if (isSameVerse) {
      this.popoverVerseActions.toggle(event, target);
    } else {
      this.popoverVerseActions.hide();

      const updatedBooks = this.allBooks().find((b) => b.name === verse.book);
      verse.testament = updatedBooks?.testament || 'old';

      this.selectedVerse.set(verse);

      setTimeout(() => {
        this.popoverVerseActions.show(event, target);
      }, 0);
    }
  }

  addBookmark(): void {
    if (!this.selectedVerse()) return;
    this.bookmarkService.addBookmark(this.selectedVerse()!);
  }

  removeBookmarked(): void {
    if (!this.selectedVerse()) return;
    this.bookmarkService.removeBookmarked(this.selectedVerse()!);
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
      const newChapter = this.selectedChapter() - 1;
      this.appSettings.setLastRead({
        book: this.paramsBook()?.name || defaultBook,
        chapter: newChapter,
        verse: 1,
      });
      this.selectChapter(newChapter);
      this.selectedVerse.set(null);
    }
  }

  nextChapter(): void {
    const chaptersCount = this.chapters().length;
    if (this.selectedChapter() < chaptersCount) {
      this.clearSearch();
      const newChapter = this.selectedChapter() + 1;
      this.appSettings.setLastRead({
        book: this.paramsBook()?.name || defaultBook,
        chapter: newChapter,
        verse: 1,
      });
      this.selectChapter(newChapter);
      this.selectedVerse.set(null);
    }
  }

  selectChapter(chapter: number): void {
    this.router.navigate(['/home'], {
      relativeTo: this.route,
      queryParams: { chapter, verse: 1 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.appSettings.setLastRead({
      book: this.paramsBook()?.name || defaultBook,
      chapter,
      verse: 1,
    });

    this.selectedVerse.set(null);
  }

  toggleSubHeader(): void {
    this.isSubHeaderVisible.set(!this.isSubHeaderVisible());
  }

  audio(): void {
    if (this.isAudioAllPlaying() || this.isAudioPlaying()) {
      return;
    }

    this.selectedAudioVerse.set(null);
    this.isAudioAllPlaying.set(true);
    this.isAudioPlaying.set(false);

    const book = this.paramsBook()?.name || defaultBook;
    const chapter = this.paramsChapter() || 1;

    this.audioService
      .getAudio({ book, chapter })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          const cleanup = () => {
            URL.revokeObjectURL(url);
            this.isAudioAllPlaying.set(false);
          };

          fromEvent(audio, 'loadedmetadata')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => audio.play());

          fromEvent(audio, 'ended')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => cleanup());
            
          fromEvent(audio, 'error')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.toastService.error('Audio playback failed');
              cleanup();
            });
        },
        error: (err) => {
          this.toastService.error(err.message);
          this.isAudioAllPlaying.set(false);
        },
      });
  }

  audioVerse(verse: Verse): void {
    if (this.isAudioAllPlaying() || this.isAudioPlaying()) {
      return;
    }

    this.selectedAudioVerse.set(verse);
    this.isAudioPlaying.set(true);
    this.isAudioAllPlaying.set(false);

    const payload = {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
    };

    this.audioService
      .getAudio(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          const cleanup = () => {
            URL.revokeObjectURL(url);
            this.isAudioPlaying.set(false);
            this.selectedAudioVerse.set(null);
          };

          fromEvent(audio, 'loadedmetadata')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => audio.play());

          fromEvent(audio, 'ended')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => cleanup());

          fromEvent(audio, 'error')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.toastService.error('Audio playback failed');
              cleanup();
            });
        },
        error: (err) => {
          this.toastService.error(err.message);
          this.isAudioPlaying.set(false);
          this.selectedAudioVerse.set(null);
        },
      });
  }

  isPlayingAudio(verse: Verse): boolean {
    return (
      this.selectedAudioVerse()?.book === verse.book &&
      this.selectedAudioVerse()?.chapter === verse.chapter &&
      this.selectedAudioVerse()?.verse === verse.verse
    );
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
