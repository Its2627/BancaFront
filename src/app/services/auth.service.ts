import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { JwtService } from './jwt.service';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  picture: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected http = inject(HttpClient);
  protected jwtSrv = inject(JwtService);

  protected _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  isAuthenticated = computed(() => {
    return !!this.currentUser();
  });

  constructor() {
    this.fetchUser().subscribe();
  }

  fetchUser() {
    return this.http.get<User>('/api/users/me')
      .pipe(
        catchError(() => {
          this.jwtSrv.removeToken();
          return of(null)
        }),
        tap(user => this._currentUser.set(user))
      )
  }

  login(username: string, password: string) {
    return this.http.post<{ user: User, token: string }>('/api/login', { username, password })
      .pipe(
        tap(res => this.jwtSrv.setToken(res.token)),
        map(res => res.user),
        tap(user => this._currentUser.set(user))
      );
  }

  logout(){
    this.jwtSrv.removeToken();
    this._currentUser.set(null);
  }

  forgotPassword(email: string) {
    return this.http.post<void>('/api/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<void>('/api/reset-password', { token, newPassword });
  }


}
