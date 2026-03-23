import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Modules
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { BibleService } from '../../shared/services/bible.service';
import { AppSettingsService } from '../../shared/services/app-settings.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, DrawerModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  isSidebarVisible: boolean = false;
  activeBook: string = '';
  books = signal<Book[]>([]);

  private route = inject(ActivatedRoute);
  private appSettings = inject(AppSettingsService);
  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private bibleService: BibleService,
  ) {
    effect(() => {
      this.isSidebarVisible = this.appSettings.isSidebarVisible;
    });
  }

  ngOnInit(): void {
    this.loadBooks();

    this.route.queryParamMap.subscribe((params) => {
      const book = params.get('book') || 'Genesis';
      this.activeBook = book;
    });
  }

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.router.navigate(['/home'], { queryParams: { book: bookName, chapter: 1 } });
    this.onDrawerClose();
  }

  private loadBooks(): void {
    this.bibleService
      .getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const sortedBooks = data.sort((a, b) => a.order - b.order);
          this.books.set(sortedBooks);
        },
        error: (err) => console.error(err.message),
      });
  }
}
