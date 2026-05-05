import { Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { BookmarkService } from '../../shared/services/bookmark.service';
import { ExportService } from '../../shared/services/export.service';

// Interfaces
import { Book } from '../../shared/interfaces/book';
import { Verse } from '../../shared/interfaces/verse';

// Dialogs
import { Bookmarks } from '../../shared/dialog/bookmarks/bookmarks';

// PrimeNG Modules
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-header',
  imports: [NgClass, ButtonModule, TooltipModule, PopoverModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  private readonly dialogService = inject(DialogService);
  private readonly bookmarkService = inject(BookmarkService);
  private readonly exportService = inject(ExportService);
  readonly appSettingsService = inject(AppSettingsService);

  readonly book = input.required<Book | undefined>();
  readonly chapter = input.required<number>();
  readonly verses = input.required<Verse[]>();

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

   exportToWord(): void {
      const fileName = this.formattedFileName();
      this.exportService.exportToWord(this.formatExportData(), fileName);
    }
  
    exportToPDF(): void {
      const fileName = this.formattedFileName();
      this.exportService.exportToPDF(this.formatExportData(), fileName);
    }
  
    exportToExcel(): void {
      const fileName = this.formattedFileName();
      const sheetName = `${this.book()?.name} Chapter ${this.chapter()}`;
      this.exportService.exportToExcel(this.formatExportData(), fileName, sheetName);
    }
  
    private formattedFileName(): string {
      const date = new Date().toDateString().replace(/\s/g, "_");
      const bookChapter = `${this.book()?.name}_Chapter_${this.chapter()}`;
      const exportFileName = `KJV_${bookChapter}_${date}`;
      return exportFileName;
    }
  
    private formatExportData() {
      return this.verses().map((verse) => {
        return {
          [`"${verse.book}" Chapter ${verse.chapter}`]: `${verse.verse} ${verse.text}`,
        };
      });
    }
}
