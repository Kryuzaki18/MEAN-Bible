import { Component, effect, inject } from '@angular/core';

// PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { BookmarkService } from '../../shared/services/bookmark.service';

// Dialogs
import { Bookmarks } from '../../shared/dialog/bookmarks/bookmarks';

@Component({
  selector: 'app-header',
  imports: [AvatarModule, BadgeModule, MenubarModule, InputTextModule, RippleModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  ref: DynamicDialogRef | undefined;
  items: MenuItem[] | undefined;
  bookmarksCount: number = 0;

  public dialogService = inject(DialogService);
  private appSettings = inject(AppSettingsService);

  constructor(private bookmarkService: BookmarkService) {
    effect(() => {
      const count = this.bookmarkService.getBookmarksCount();
      this.bookmarksCount = count;
      this.loadMenuItems();
    });
  }

  show(): void {
    this.dialogService.open(Bookmarks, {
      header: '',
      showHeader: false,
      width: '960px',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  private loadMenuItems(): void {
    this.items = [
      {
        label: 'Books',
        icon: 'pi pi-book',
        command: this.onToggleSidebar,
      },
      {
        label: `Bookmarks${this.bookmarksCount > 0 ? ` (${this.bookmarksCount})` : ''}`,
        icon: 'pi pi-bookmark',
        command: () => this.show(),
        disabled: this.bookmarksCount === 0,
      },
    ];
  }

  private onToggleSidebar = (): void => {
    this.appSettings.toggleSidebar();
  };
}
