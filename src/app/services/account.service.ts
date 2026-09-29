import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface Profile {
  contoCorrenteId: number;
  email: string;
  nomeTitolare: string;
  cognomeTitolare: string;
  dataApertura: string;
  iban: string | null;
}

// true = dati finti (senza backend), false = chiamata HTTP vera
const USE_MOCK = true;

const MOCK_PROFILE: Profile = {
  contoCorrenteId: 1,
  email: 'mario.rossi@example.com',
  nomeTitolare: 'Mario',
  cognomeTitolare: 'Rossi',
  dataApertura: '2026-01-15T12:00:00',
  iban: 'IT60X0542811101000000123456',
};

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getProfile(): Observable<Profile> {
    if (USE_MOCK) {
      return of(MOCK_PROFILE).pipe(delay(300));
    }
    // metti qui l'URL vero della tua WebApi
    return this.http.get<Profile>('/api/il-tuo-endpoint');
  }
}