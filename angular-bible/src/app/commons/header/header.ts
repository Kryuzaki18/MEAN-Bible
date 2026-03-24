import { Component, inject, OnInit } from '@angular/core';

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

// Dialogs
import { Bookmarks } from '../../shared/dialog/bookmarks/bookmarks';


@Component({
  selector: 'app-header',
  imports: [AvatarModule, BadgeModule, MenubarModule, InputTextModule, RippleModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header implements OnInit {
  ref: DynamicDialogRef | undefined;
  items: MenuItem[] | undefined;

  public dialogService = inject(DialogService);
  private appSettings = inject(AppSettingsService);

  ngOnInit(): void {
    this.loadMenuItems();
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
        label: 'Bookmarks',
        icon: 'pi pi-bookmark',
        command: () => this.show(),
      },
    ];
  }

  private onToggleSidebar = (): void => {
    this.appSettings.toggleSidebar();
  };
}
