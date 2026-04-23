import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  isSidebarVisible = signal(false);

  toggleSidebar(): void {
    this.isSidebarVisible.set(!this.isSidebarVisible());
  }
}
