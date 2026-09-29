import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inserisci-pin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inserisci-pin.component.html',
  styleUrl: './inserisci-pin.component.css'
})
export class InserisciPinComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  cartaId = '';
  azione: 'cvv' | 'blocca' | 'elimina' | string = 'cvv';
  pin = '';
  loading = false;
  errore = '';
  
  completato = false;
  cvvMostrato: string | null = null;
  messaggioSuccesso = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cartaId = params['carta'];
      this.azione = params['azione'] || 'cvv';
    });
  }

  confermaPin(): void {
    if (this.pin.length < 4) return;

    this.loading = true;
    this.errore = '';

    if (this.azione === 'cvv') {
      // Chiamata per recuperare il CVV
      this.http.post<{ cvv: string }>(`/api/carte/${this.cartaId}/cvv`, { pin: this.pin })
        .subscribe({
          next: (res) => {
            this.loading = false;
            this.cvvMostrato = res.cvv;
            this.completato = true;
          },
          error: (err) => {
            this.loading = false;
            this.errore = err.error?.message || 'PIN errato o errore del server.';
          }
        });
    } else if (this.azione === 'blocca') {
      // Chiamata per bloccare la carta
      this.http.post(`/api/carte/${this.cartaId}/blocca`, { pin: this.pin })
        .subscribe({
          next: () => {
            this.loading = false;
            this.messaggioSuccesso = 'La carta è stata bloccata con successo.';
            this.completato = true;
          },
          error: (err) => {
            this.loading = false;
            this.errore = err.error?.message || 'PIN errato o errore nel blocco della carta.';
          }
        });
    } else if (this.azione === 'elimina') {
      // Chiamata per eliminare la carta
      this.http.delete(`/api/carte/${this.cartaId}`, { body: { pin: this.pin } })
        .subscribe({
          next: () => {
            this.loading = false;
            this.messaggioSuccesso = 'La carta è stata eliminata con successo.';
            this.completato = true;
          },
          error: (err) => {
            this.loading = false;
            this.errore = err.error?.message || 'PIN errato o errore durante l\'eliminazione.';
          }
        });
    }
  }

  chiudi(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}