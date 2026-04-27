import { Injectable, signal, effect, inject } from '@angular/core';

// Services
import { LocalStorageService } from './local-storage.service';

// Constants
import { storage } from '../constants/local-storage.constant';

@Injectable({
  providedIn: 'root',
})
export class AppSettingsService {
  private localStorageService = inject(LocalStorageService);

  isSidebarVisible = signal(false);
  isDarkMode = this.localStorageService.getLocalStorageSignal<boolean>(storage.DARK_MODE, false);

  constructor() {
    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.add('bg-[var(--p-primary-900)]/80');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.remove('bg-[var(--p-primary-900)]/80');
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarVisible.set(!this.isSidebarVisible());
  }

  toggleDarkMode(): void {
    this.localStorageService.updateLocalStorageSignal(storage.DARK_MODE, !this.isDarkMode());
  }
}

