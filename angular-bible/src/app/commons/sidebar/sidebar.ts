import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Modules
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { BibleService } from '../../shared/services/bible.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, DrawerModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  isSidebarVisible: boolean = true;
  books = signal<Book[]>([]);

  private destroyRef = inject(DestroyRef);

  constructor(private bibleService: BibleService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.bibleService
      .getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.books.set(data),
        error: (err) => console.error(err.message),
      });
  }
}
