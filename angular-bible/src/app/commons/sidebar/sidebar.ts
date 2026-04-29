import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
import { Book } from '../../shared/interfaces/book';

// Services
import { AppSettingsService } from '../../shared/services/app-settings.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    NgClass,
    ButtonModule,
    ScrollPanelModule,
    SelectButtonModule,
    FormsModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements AfterViewInit {
  private readonly appSettings = inject(AppSettingsService);
  private readonly router = inject(Router);

  @ViewChildren('bookButtons') bookButtons!: QueryList<ElementRef>;

  readonly selectedBook = input<Book>({} as Book);
  readonly allBooks = input<Book[]>([]);
  readonly onBookSelected = output<string>();

  readonly testament = signal<number>(0);

  readonly isSidebarVisible = computed(() => this.appSettings.isSidebarVisible);

  readonly testaments = [
    { label: 'Old', value: 0 },
    { label: 'New', value: 1 },
  ];

  readonly filteredBooks = computed(() => {
    if (this.testament() === 0) {
      return this.allBooks().filter((book) => book.testament.toLowerCase() === 'old');
    }
    return this.allBooks().filter((book) => book.testament.toLowerCase() === 'new');
  });

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBook(this.selectedBook().name);
    }, 500);
  }

  scrollToBook(bookName: string): void {
    const book = this.allBooks().find((b) => b.name === bookName);
    const newTestament = book?.testament.toLowerCase() === 'old' ? 0 : 1;
    this.updateTestament(newTestament);
    const index = this.filteredBooks().findIndex((b) => b.name === bookName);
    const buttonEl = this.bookButtons.get(index);
    buttonEl?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  onDrawerClose(): void {
    this.appSettings.toggleSidebar();
  }

  navigateToBook(bookName: string): void {
    this.onBookSelected.emit(bookName);

    const lastRead = {
      book: bookName,
      chapter: 1,
      verse: 1,
    };

    this.appSettings.setLastRead(lastRead);
    this.router.navigate(['/home'], { queryParams: lastRead });
  }

  updateTestament(testament: number): void {
    this.testament.set(testament);
  }
}
