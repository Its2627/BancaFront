import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { JwtService } from './jwt.service';
import { ApiUser } from './api.model';

export type User = ApiUser;

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
    birthDate: string;
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

    protected _ready = signal(false);
  ready = this._ready.asReadonly();

  isAuthenticated = computed(() => !!this.currentUser());

    private bootstrap$: Observable<User | null>;

  constructor() {

    if (this.jwtSrv.hasToken()) {
      this.bootstrap$ = this.fetchUser().pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.bootstrap$.subscribe();
    } else {
      this._ready.set(true);
      this.bootstrap$ = of(null);
    }
  }

    ensureLoaded(): Observable<User | null> {
    return this._ready() ? of(this._currentUser()) : this.bootstrap$;
  }

  fetchUser(): Observable<User | null> {
    return this.http.get<User>('/api/users/me').pipe(
      catchError(() => {
        this.jwtSrv.removeToken();
        return of(null);
      }),
      tap(user => this._currentUser.set(user)),
      finalize(() => this._ready.set(true))
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<{ user: User; token: string }>('/api/auth/login', { email, password })
      .pipe(
        tap(res => this.jwtSrv.setToken(res.token)),
        map(res => res.user),
        tap(user => {
          this._currentUser.set(user);
          this._ready.set(true);
        })
      );
  }

    register(payload: RegisterPayload) {
    return this.http.post<{ user: User; bankAccount: unknown }>('/api/auth/register', payload);
  }

    logout(): Observable<unknown> {
    const clear = () => {
      this.jwtSrv.removeToken();
      this._currentUser.set(null);
    };

    return this.http.post<{ loggedOut: boolean }>('/api/auth/logout', {}).pipe(
      catchError(() => of(null)),
      tap(clear)
    );
  }

  forgotPassword(email: string) {
    return this.http.post<{ sent: boolean }>('/api/auth/forgot-password', { email });
  }

    resetPassword(token: string, newPassword: string) {
    return this.http.post<{ updated: boolean }>('/api/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  resendVerificationCode(email: string) {
    return this.http.post<{ sent: boolean }>('/api/auth/resend-code', { email });
  }
}
