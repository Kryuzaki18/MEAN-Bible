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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Constants
import { defaultBook } from '../../shared/constants/bible.constant';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @ViewChildren('bookButtons') bookButtons!: QueryList<ElementRef>;

  readonly allBooks = input<Book[]>([]);

  readonly testament = signal<number>(0);
  readonly queryParams = toSignal(this.route.queryParamMap);

  readonly testaments = [
    { label: 'Old', value: 0 },
    { label: 'New', value: 1 },
  ];

  readonly isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  readonly filteredBooks = computed(() => {
    if (this.testament() === 0) {
      return this.allBooks().filter((book) => book.testament.toLowerCase() === 'old');
    }
    return this.allBooks().filter((book) => book.testament.toLowerCase() === 'new');
  });

  readonly selectedBook = computed(() => {
    const newBook = this.queryParams()?.get('book') || defaultBook;
    return this.allBooks().find((b) => b.name.toLowerCase() === newBook.toLowerCase());
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
      .subscribe((params) => {
        this.scrollToBook();
      });
  }

  scrollToBook(): void {
    const bookName = this.selectedBook()?.name;
    const book = this.allBooks().find((b) => b.name.toLowerCase() === bookName?.toLowerCase());
    const newTestament = book?.testament.toLowerCase() === 'old' ? 0 : 1;
    this.updateTestament(newTestament);

    const index = this.filteredBooks().findIndex(
      (b) => b.name.toLowerCase() === bookName?.toLowerCase(),
    );

    setTimeout(() => {
      const buttonEl = this.bookButtons.get(index);
      buttonEl?.nativeElement.scrollIntoView({ behavior: 'smooth'});
    }, 250);
  }

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.appSettings.isSidebarVisible.set(false);

    const lastRead = {
      book: bookName,
      chapter: 1,
      verse: 1,
    };

    this.appSettings.setLastRead(lastRead);

    this.router.navigate(['/home'], {
      relativeTo: this.route,
      queryParams: lastRead,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  updateTestament(testament: number): void {
    this.testament.set(testament);
  }
}
