import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Interfaces
import { Book, LastRead } from '../../shared/interfaces/book';

// Constants
import { storage } from '../../shared/constants/local-storage.constant';
import { defaultBook } from '../../shared/constants/bible.constant';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';


@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    NgClass,
    ButtonModule,
    ScrollPanelModule,
    SelectButtonModule,
    FormsModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private readonly appSettings = inject(AppSettingsService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @ViewChildren('bookButtons') bookButtons!: QueryList<ElementRef>;

   private readonly lastRead = this.localStorageService.getLocalStorageSignal<LastRead>(
      storage.LAST_READ,
      { book: defaultBook, chapter: 1, verse: 1, date: new Date() },
    );

  readonly selectedBook = input<Book>({} as Book);
  readonly allBooks = input<Book[]>([]);
  readonly onBookSelected = output<string>();

  readonly testament = signal<number>(0);

  readonly isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  readonly testaments = [
    { label: 'Old', value: 0 },
    { label: 'New', value: 1 },
  ];

  readonly filteredBooks = computed(() => {
    if (this.testament() === 0) {
      return this.allBooks().filter((book) => book.testament.toLowerCase() === 'old');
    }
    return this.allBooks().filter((book) => book.testament.toLowerCase() === 'new');
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const book = params.get('book') ?? defaultBook;
      setTimeout(() => {
        this.scrollToBook(book);
      }, 100);
    });
  }

  scrollToBook(bookName: string): void {
    const book = this.allBooks().find((b) => b.name === bookName);
    const newTestament = book?.testament.toLowerCase() === 'old' ? 0 : 1;
    this.updateTestament(newTestament);
    const index = this.filteredBooks().findIndex((b) => b.name === bookName);
    const buttonEl = this.bookButtons.get(index);
    buttonEl?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.onBookSelected.emit(bookName);

    const lastRead = {
      book: bookName,
      chapter: 1,
      verse: 1,
    };

    this.appSettings.setLastRead(lastRead);
    this.router.navigate(['/home'], { queryParams: lastRead });
  }

  updateTestament(testament: number): void {
    this.testament.set(testament);
  }
}
