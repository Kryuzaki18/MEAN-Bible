import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Sidebar } from '../../commons/sidebar/sidebar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BibleService } from '../../shared/services/bible.service';
import { Verse } from '../../shared/interfaces/verse';

@Component({
  selector: 'app-main',
  imports: [Sidebar],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  standalone: true,
})
export class Main {
  verses = signal<Verse[]>([]);

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  constructor(private bibleService: BibleService) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const book = params.get('book') || 'Genesis';
      const chapter = params.get('chapter') || '1';
      console.log({ book, chapter });
      if (book && chapter) {
        this.getChapter(book, +chapter);
      }
    });
  }

  getChapter(book: string, chapter: number): void {
    this.bibleService
      .getChapter(book, chapter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.verses.set(data);
      });
  }
}
