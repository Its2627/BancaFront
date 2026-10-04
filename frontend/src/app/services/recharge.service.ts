import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RechargePageData } from '../entities';
import { Cached } from './cache';
import { AccountService } from './account.service';
import { MovementService } from './movement.service';
import { StatsService } from './stats.service';

@Injectable({
  providedIn: 'root'
})
export class RechargeService {
  private http = inject(HttpClient);

  private accountSrv = inject(AccountService);
  private movementSrv = inject(MovementService);
  private statsSrv = inject(StatsService);

  private apiUrl = '/api/recharge';

  private readonly pageCache = new Cached<RechargePageData>();

  getPageData(): Observable<RechargePageData> {
    return this.pageCache.get(() =>
      this.http.get<RechargePageData>(`${this.apiUrl}/dashboard-data`)
    );
  }

  effettuaRicarica(payload: { phoneNumber: string; operator: string; amount: number }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/do-recharge`, payload).pipe(
      tap(() => {
        this.pageCache.clear();
        this.accountSrv.invalidate();
        this.movementSrv.invalidate();
        this.statsSrv.invalidate();
      })
    );
  }
}
