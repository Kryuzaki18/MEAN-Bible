import { Component, computed, inject, input, output } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgClass } from '@angular/common';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgClass, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  selectedBook = input<Book>({} as Book);
  allBooks = input<Book[]>([]);

  isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  onBookSelected = output<string>();

  private appSettings = inject(AppSettingsService);

  constructor(private router: Router) {}

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.onBookSelected.emit(bookName);
    this.router.navigate(['/home'], { queryParams: { book: bookName, chapter: 1 } });
  }
}
