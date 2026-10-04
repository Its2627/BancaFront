import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransactionStats {
  from: string;
  to: string;
  totalIn: number;
  totalOut: number;
  byCategory: { categoryName: string; total: number }[];
    byMonth: { label: string; income: number; expense: number }[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

    get(from?: Date, to?: Date): Observable<TransactionStats> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from.toISOString());
    }
    if (to) {
      params = params.set('to', to.toISOString());
    }

    return this.http.get<TransactionStats>('/api/transactions/stats', { params });
  }
}
