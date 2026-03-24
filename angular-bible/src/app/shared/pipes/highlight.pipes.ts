import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, query: string | null): { text: string; match: boolean }[] {
    if (!query?.trim() || query.length <= 1) return [{ text, match: false }];

    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part) => ({
      text: part,
      match: part.toLowerCase() === query.toLowerCase(),
    }));
  }
}
