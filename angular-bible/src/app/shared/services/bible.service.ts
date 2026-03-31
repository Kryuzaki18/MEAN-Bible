import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';

// Environment
import { environment } from '../../../environments/environment.prod';

// Interfaces
import { Book } from '../interfaces/book';
import { Verse } from '../interfaces/verse';

@Injectable({
  providedIn: 'root'
})
export class BibleService {
  private baseUrl = environment.apiUrl;

  private cache: { [key: string]: Observable<any> } = {};

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    const key = 'books';

    if (!this.cache[key]) {
      this.cache[key] = this.http
        .get<Book[]>(`${this.baseUrl}/books`)
        .pipe(
          shareReplay(1),
          catchError(this.handleError)
        );
    }

    return this.cache[key];
  }
  
  getChapter(book: string, chapter: number): Observable<Verse> {
    return this.http
      .get<Verse>(`${this.baseUrl}/chapter/${book}/${chapter}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getVerse(book: string, chapter: number, verse: number): Observable<Verse> {
    return this.http
      .get<Verse>(`${this.baseUrl}/verse/${book}/${chapter}/${verse}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  search(query: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/search`, {
        params: { q: query }
      })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let message = 'Something went wrong';

    if (error.status === 0) {
      message = 'Network error';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => new Error(message));
  }
}