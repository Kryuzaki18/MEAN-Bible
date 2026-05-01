import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Environment
import { ROUTES } from '../../../environments/environment';

interface AudioPayload {
  book: string;
  chapter: number;
  verse?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly http = inject(HttpClient);

  getAudio(payload: AudioPayload): Observable<Blob> {
    if (!payload.verse) {
      delete payload.verse;
    }

    return this.http.post(ROUTES.audio, payload, { responseType: 'blob' });
  }
}
