import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { ApiBankAccount, ApiUser } from './api.model';
import { Cached } from './cache';

export interface Profile {
  contoCorrenteId: string;
  email: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  dataApertura: string;
  iban: string | null;
  saldo: number;
  dataNascita: string;
  emailVerificata: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  private readonly userCache = new Cached<ApiUser>();
  private readonly accountCache = new Cached<ApiBankAccount>();

  invalidate(): void {
    this.userCache.clear();
    this.accountCache.clear();
  }

  getUser(): Observable<ApiUser> {
    return this.userCache.get(() => this.http.get<ApiUser>('/api/users/me'));
  }

    getBankAccount(): Observable<ApiBankAccount> {
    return this.accountCache.get(() => this.http.get<ApiBankAccount>('/api/accounts/me'));
  }

  getProfile(): Observable<Profile> {
    return combineLatest([this.getUser(), this.getBankAccount()]).pipe(
      map(([user, account]) => ({
        contoCorrenteId: account.id,
        email: user.email,
        nomeTitolare: user.firstName,
        cognomeTitolare: user.lastName,

        dataApertura: account.createdAt,
        iban: account.iban ?? null,
        saldo: account.balanceEuro,
        dataNascita: user.birthDate,
        emailVerificata: user.emailVerified,
      })),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

    getBalance(): Observable<number> {
    return this.getBankAccount().pipe(map(account => account.balanceEuro));
  }
}
