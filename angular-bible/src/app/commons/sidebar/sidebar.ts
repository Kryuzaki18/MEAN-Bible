import { Component, computed, inject, input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgClass } from '@angular/common';

// PrimeNG Modules
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgClass, DrawerModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  selectedBook = input<Book>({} as Book);
  allBooks = input<Book[]>([]);

  isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  private appSettings = inject(AppSettingsService);

  constructor(private router: Router) {}

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.router.navigate(['/home'], { queryParams: { book: bookName, chapter: 1 } });
    this.onDrawerClose();
  }
}
