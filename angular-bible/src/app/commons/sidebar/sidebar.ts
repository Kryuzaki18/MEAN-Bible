import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgClass } from '@angular/common';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgClass, ButtonModule, ScrollPanelModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  selectedBook = input<Book>({} as Book);
  allBooks = input<Book[]>([]);
  onBookSelected = output<string>();

  isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  testament = signal<number>(0);

  filteredBooks = computed(() => {
    if (this.testament() === 0) {
      return this.allBooks().filter((book) => book.testament.toLowerCase() === 'old');
    }
    return this.allBooks().filter((book) => book.testament.toLowerCase() === 'new');
  });

  private appSettings = inject(AppSettingsService);
  private router = inject(Router);

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.onBookSelected.emit(bookName);
    this.router.navigate(['/home'], { queryParams: { book: bookName, chapter: 1 } });
  }

  updateTestament(testament: number): void {
    this.testament.set(testament);
  }
}
