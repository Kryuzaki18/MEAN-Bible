import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Environment
import { ROUTES } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly http = inject(HttpClient);

  getAudio(book: string, chapter: number): Observable<Blob> {
    return this.http.post(ROUTES.audio, { book, chapter }, { responseType: 'blob' });
  }
}
