import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private _isSidebarVisible = signal(false);

  get isSidebarVisible(): boolean {
    return this._isSidebarVisible();
  }

  toggleSidebar(): void {
    this._isSidebarVisible.set(!this._isSidebarVisible());
  }
}
