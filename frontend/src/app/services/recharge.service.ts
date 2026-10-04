import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RechargePageData } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class RechargeService {
  private http = inject(HttpClient);

  private apiUrl = '/api/recharge';

  getPageData(): Observable<RechargePageData> {
    return this.http.get<RechargePageData>(`${this.apiUrl}/dashboard-data`);
  }

  effettuaRicarica(payload: { phoneNumber: string; operator: string; amount: number }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/do-recharge`, payload);
  }
}
