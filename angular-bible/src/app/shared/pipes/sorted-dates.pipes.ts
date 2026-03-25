import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortedDates',
  standalone: true,
})
export class SortedDatesPipe implements PipeTransform {
  transform<T extends { dateAdded?: string }>(items: T[]): T[] {
    return [...items].sort(
      (a, b) => new Date(b.dateAdded ?? 0).getTime() - new Date(a.dateAdded ?? 0).getTime(),
    );
  }
}
