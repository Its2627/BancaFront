import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { combineLatest, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ApiPaginated, ApiTransaction, ApiTransactionCategory } from './api.model';
import { AccountService } from './account.service';
import { Cached } from './cache';

export interface Movement {
  id: string;
  date: Date;
    amount: number;
  categoryName: string;
  categoryType: 'income' | 'expense';
  description: string;
  balanceAfter: number;
  counterparty: string | null;
}

export interface SearchResultWithBalance {
  movements: Movement[];
  finalBalance: number;
}

function toMovement(t: ApiTransaction): Movement {
  const counterparty = [t.counterparty?.firstName, t.counterparty?.lastName]
    .filter(Boolean)
    .join(' ');

  return {
    id: t.id,
    date: new Date(t.date),
    amount: t.direction === 'out' ? -t.amountEuro : t.amountEuro,
    categoryName: t.category.categoryName,
    categoryType: t.category.type,
    description: t.paymentReference,
    balanceAfter: t.balanceAfterEuro,
    counterparty: counterparty || t.counterparty?.iban || null,
  };
}

@Injectable({ providedIn: 'root' })
export class MovementService {
  private http = inject(HttpClient);
  private accountSrv = inject(AccountService);

  private readonly baseUrl = '/api/transactions';

    private categories$ = this.http
    .get<ApiTransactionCategory[]>('/api/transaction-categories')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getCategories(): Observable<ApiTransactionCategory[]> {
    return this.categories$;
  }

    private categoryIdByName(name: string): Observable<string | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(c => c.categoryName === name)?.id)
    );
  }

  private query(params: HttpParams): Observable<Movement[]> {
    return this.http
      .get<ApiPaginated<ApiTransaction>>(this.baseUrl, { params })
      .pipe(map(page => page.items.map(toMovement)));
  }

    getById(id: string): Observable<ApiTransaction> {
    return this.http.get<ApiTransaction>(`${this.baseUrl}/${id}`);
  }

  private readonly lastMovements = new Map<number, Cached<SearchResultWithBalance>>();

  invalidate(): void {
    this.lastMovements.forEach(cache => cache.clear());
  }

  getLastMovements(n: number): Observable<SearchResultWithBalance> {
    let cache = this.lastMovements.get(n);

    if (!cache) {
      cache = new Cached<SearchResultWithBalance>();
      this.lastMovements.set(n, cache);
    }

    return cache.get(() => {
      const params = new HttpParams().set('limit', n).set('page', 1);

      return combineLatest([this.query(params), this.accountSrv.getBalance()]).pipe(
        map(([movements, finalBalance]) => ({ movements, finalBalance }))
      );
    });
  }

    getMovementsByCategory(n: number, category: string): Observable<Movement[]> {
    return this.categoryIdByName(category).pipe(
      switchMap(categoryId => {

        if (!categoryId) {
          return of([] as Movement[]);
        }

        return this.query(
          new HttpParams().set('limit', n).set('page', 1).set('categoryId', categoryId)
        );
      })
    );
  }

    getMovementsByDateRange(n: number, startDate: Date, endDate: Date): Observable<Movement[]> {
    const params = new HttpParams()
      .set('limit', n)
      .set('page', 1)
      .set('from', startDate.toISOString())
      .set('to', endDate.toISOString());

    return this.query(params);
  }

    getMovementsByCategoryAndDateRange(
    n: number,
    category: string,
    startDate: Date,
    endDate: Date
  ): Observable<Movement[]> {
    return this.categoryIdByName(category).pipe(
      switchMap(categoryId => {
        if (!categoryId) {
          return of([] as Movement[]);
        }

        return this.query(
          new HttpParams()
            .set('limit', n)
            .set('page', 1)
            .set('categoryId', categoryId)
            .set('from', startDate.toISOString())
            .set('to', endDate.toISOString())
        );
      })
    );
  }
}
