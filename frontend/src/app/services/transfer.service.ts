import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiTransaction } from './api.model';
import { AccountService } from './account.service';
import { MovementService } from './movement.service';
import { StatsService } from './stats.service';

export interface TransferPayload {
  iban: string;
  firstName: string;
  lastName: string;
  amount: number;
  paymentReference: string;
}

@Injectable({ providedIn: 'root' })
export class TransferService {
  private http = inject(HttpClient);
  private accountSrv = inject(AccountService);
  private movementSrv = inject(MovementService);
  private statsSrv = inject(StatsService);

    transfer(payload: TransferPayload): Observable<ApiTransaction> {
    return this.http.post<ApiTransaction>('/api/transactions/transfer', payload).pipe(
      tap(() => {
        this.accountSrv.invalidate();
        this.movementSrv.invalidate();
        this.statsSrv.invalidate();
      })
    );
  }

    getSaldo(): Observable<number> {
    return this.accountSrv.getBalance();
  }
}
