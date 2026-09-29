import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Movement {
  date: Date;
  amount: number;
  categoryName: string;
}

export interface SearchResultWithBalance {
  movements: Movement[];
  finalBalance: number;
}

export const MOVEMENT_CATEGORIES: string[] = [
  'Stipendio',
  'Spesa',
  'Bollette',
  'Svago',
  'Trasporti',
  'Altro'
];

/** Il backend restituisce le date come stringhe JSON: qui le convertiamo in Date */
function parseMovementDates(movements: Movement[]): Movement[] {
  return movements.map(m => ({ ...m, date: new Date(m.date) }));
}

/**
 * Servizio collegato al backend reale tramite HttpClient.
 * Adatta baseUrl e i singoli endpoint al tuo backend effettivo.
 */
@Injectable({ providedIn: 'root' })
export class MovementService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/movements';

  /** RicercaMovimenti1: ultimi n movimenti + saldo finale */
  getLastMovements(n: number): Observable<SearchResultWithBalance> {
    const params = new HttpParams().set('n', n);
    return this.http.get<SearchResultWithBalance>(`${this.baseUrl}/last`, { params }).pipe(
      map(result => ({ ...result, movements: parseMovementDates(result.movements) }))
    );
  }

  /** RicercaMovimenti2: ultimi n movimenti di una categoria (senza saldo) */
  getMovementsByCategory(n: number, category: string): Observable<Movement[]> {
    const params = new HttpParams().set('n', n).set('category', category);
    return this.http.get<Movement[]>(`${this.baseUrl}/by-category`, { params }).pipe(
      map(parseMovementDates)
    );
  }

  /** RicercaMovimenti3: ultimi n movimenti tra due date (senza saldo) */
  getMovementsByDateRange(n: number, startDate: Date, endDate: Date): Observable<Movement[]> {
    const params = new HttpParams()
      .set('n', n)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<Movement[]>(`${this.baseUrl}/by-date-range`, { params }).pipe(
      map(parseMovementDates)
    );
  }

  getCategories(): string[] {
    return MOVEMENT_CATEGORIES;
  }
}