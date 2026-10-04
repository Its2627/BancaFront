import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { ApiCard, ApiCardDetails, ApiCreatedCard, CardType } from './api.model';
import { Cached } from './cache';

export interface CreateCardPayload {
  name: string;
    pin: string;
  type: CardType;
    creditLimit?: number;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);

  private readonly baseUrl = '/api/cards';

    private readonly _changed = new Subject<void>();
  changed = this._changed.asObservable();

  private readonly listCache = new Cached<ApiCard[]>();

  invalidate(): void {
    this.listCache.clear();
  }

  notifyChanged(): void {
    this.listCache.clear();
    this._changed.next();
  }

    list(): Observable<ApiCard[]> {
    return this.listCache.get(() => this.http.get<ApiCard[]>(this.baseUrl));
  }

    create(payload: CreateCardPayload): Observable<ApiCreatedCard> {
    return this.http.post<ApiCreatedCard>(`${this.baseUrl}/create`, payload).pipe(
      tap(() => this.notifyChanged())
    );
  }

    reveal(cardId: string, pin: string): Observable<ApiCardDetails> {
    return this.http.post<ApiCardDetails>(`${this.baseUrl}/${cardId}/details`, { pin });
  }

    revealPin(cardId: string, password: string): Observable<{ pin: string }> {
    return this.http.post<{ pin: string }>(`${this.baseUrl}/${cardId}/pin`, { password });
  }

  activate(cardId: string): Observable<ApiCard> {
    return this.http.patch<ApiCard>(`${this.baseUrl}/${cardId}/activate`, {}).pipe(
      tap(() => this.notifyChanged())
    );
  }

  block(cardId: string): Observable<ApiCard> {
    return this.http.patch<ApiCard>(`${this.baseUrl}/${cardId}/block`, {}).pipe(
      tap(() => this.notifyChanged())
    );
  }

  changePin(cardId: string, currentPin: string, newPin: string): Observable<{ updated: boolean }> {
    return this.http.patch<{ updated: boolean }>(`${this.baseUrl}/${cardId}/pin`, {
      currentPin,
      newPin,
    });
  }

    remove(cardId: string): Observable<ApiCard> {
    return this.http.delete<ApiCard>(`${this.baseUrl}/${cardId}`).pipe(
      tap(() => this.notifyChanged())
    );
  }
}
