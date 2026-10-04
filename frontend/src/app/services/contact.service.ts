import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  iban: string;
}

export interface CreateContactPayload {
  firstName: string;
  lastName: string;
  iban: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  private readonly baseUrl = '/api/contacts';

  list(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.baseUrl);
  }

    create(payload: CreateContactPayload): Observable<Contact> {
    return this.http.post<Contact>(this.baseUrl, payload);
  }

  remove(contactId: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${contactId}`);
  }
}
