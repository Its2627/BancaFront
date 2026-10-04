import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({ providedIn: 'root' })
export class ChangePasswordService {
  private http = inject(HttpClient);
  private jwtSrv = inject(JwtService);

    changePassword(oldPassword: string, newPassword: string): Observable<{ updated: boolean }> {
    return this.http
      .patch<{ updated: boolean }>('/api/auth/password', {
        currentPassword: oldPassword,
        newPassword,
      })
      .pipe(tap(() => this.jwtSrv.removeToken()));
  }
}
