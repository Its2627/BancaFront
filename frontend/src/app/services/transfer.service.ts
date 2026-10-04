import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiTransaction } from './api.model';
import { AccountService } from './account.service';

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

    transfer(payload: TransferPayload): Observable<ApiTransaction> {
    return this.http.post<ApiTransaction>('/api/transactions/transfer', payload);
  }

    getSaldo(): Observable<number> {
    return this.accountSrv.getBalance();
  }
}
