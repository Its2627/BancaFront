import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, delay } from 'rxjs';

// true = simulazione (senza backend), false = chiamata HTTP vera
const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class ChangePasswordService {
  private http = inject(HttpClient);

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    if (USE_MOCK) {
      // per provare l'errore, scrivi "errata" come password attuale
      if (oldPassword === 'errata') {
        return throwError(() => ({ status: 400 })).pipe(delay(500));
      }
      return of(void 0).pipe(delay(500));
    }
    return this.http.post<void>('/api/account/change-password', { oldPassword, newPassword });
  }
}