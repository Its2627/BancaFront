import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RechargePageData } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class RechargeService {
  private apiUrl = 'http://localhost:8080/api/recharge'; // Cambia con l'URL del tuo backend

  constructor(private http: HttpClient) {}

  // Recupera rubrica, ultime ricariche ed analytics
  getPageData(): Observable<RechargePageData> {
    return this.http.get<RechargePageData>(`${this.apiUrl}/dashboard-data`);
  }

  // Effettua la ricarica inviando i dati al backend
  effettuaRicarica(payload: { phoneNumber: string; operator: string; amount: number }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/do-recharge`, payload);
  }
}