import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiCard, ApiCardDetails, ApiCreatedCard, CardType } from './api.model';

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

  notifyChanged(): void {
    this._changed.next();
  }

    list(): Observable<ApiCard[]> {
    return this.http.get<ApiCard[]>(this.baseUrl);
  }

    create(payload: CreateCardPayload): Observable<ApiCreatedCard> {
    return this.http.post<ApiCreatedCard>(`${this.baseUrl}/create`, payload);
  }

    reveal(cardId: string, pin: string): Observable<ApiCardDetails> {
    return this.http.post<ApiCardDetails>(`${this.baseUrl}/${cardId}/details`, { pin });
  }

    revealPin(cardId: string, password: string): Observable<{ pin: string }> {
    return this.http.post<{ pin: string }>(`${this.baseUrl}/${cardId}/pin`, { password });
  }

  activate(cardId: string): Observable<ApiCard> {
    return this.http.patch<ApiCard>(`${this.baseUrl}/${cardId}/activate`, {});
  }

  block(cardId: string): Observable<ApiCard> {
    return this.http.patch<ApiCard>(`${this.baseUrl}/${cardId}/block`, {});
  }

  changePin(cardId: string, currentPin: string, newPin: string): Observable<{ updated: boolean }> {
    return this.http.patch<{ updated: boolean }>(`${this.baseUrl}/${cardId}/pin`, {
      currentPin,
      newPin,
    });
  }

    remove(cardId: string): Observable<ApiCard> {
    return this.http.delete<ApiCard>(`${this.baseUrl}/${cardId}`);
  }
}
