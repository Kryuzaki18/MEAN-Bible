import { Component, computed, inject, output } from '@angular/core';

// PrimeNG Modules
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { BookmarkService } from '../../shared/services/bookmark.service';

// Dialogs
import { Bookmarks } from '../../shared/dialog/bookmarks/bookmarks';

@Component({
  selector: 'app-header',
  imports: [ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  dialogService = inject(DialogService);
  bookmarkService = inject(BookmarkService);
  appSettingsService = inject(AppSettingsService);

  onToggleSidebar = output<void>();

  ref: DynamicDialogRef | undefined;

  bookmarks = this.bookmarkService.bookmarks;

  show(): void {
    if (this.bookmarks().length === 0) {
      return;
    }

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
}
