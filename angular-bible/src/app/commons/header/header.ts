import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { BookmarkService } from '../../shared/services/bookmark.service';

// Dialogs
import { Bookmarks } from '../../shared/dialog/bookmarks/bookmarks';

// PrimeNG Modules
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [NgClass, ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  private readonly dialogService = inject(DialogService);
  private readonly bookmarkService = inject(BookmarkService);
  readonly appSettingsService = inject(AppSettingsService);

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
      height: '640px',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      style: {
        height: 'min(640px, 90dvh)',
      },
      contentStyle: {
        overflow: 'hidden',
        paddingRight: 0,
      },
    });
  }
}
