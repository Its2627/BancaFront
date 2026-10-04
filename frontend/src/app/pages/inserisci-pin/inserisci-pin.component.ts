import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { CardService } from '../../services/card.service';

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
  private cardSrv = inject(CardService);

    pin = '';

  cartaId = signal<string>('');
  azione = signal<string>('cvv');

  loading = signal<boolean>(false);
  errore = signal<string>('');

  completato = signal<boolean>(false);
  cvvMostrato = signal<string | null>(null);
  numeroMostrato = signal<string | null>(null);
  messaggioSuccesso = signal<string>('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cartaId.set(params['carta'] ?? '');
      this.azione.set(params['azione'] ?? 'cvv');
    });
  }

  confermaPin(): void {
    if (this.pin.length < 4) return;

    this.loading.set(true);
    this.errore.set('');

    const cardId = this.cartaId();

    if (this.azione() === 'cvv') {

      this.cardSrv.reveal(cardId, this.pin).subscribe({
        next: res => {
          this.loading.set(false);
          this.numeroMostrato.set(res.cardNumber);
          this.cvvMostrato.set(res.cvv);
          this.completato.set(true);
        },
        error: err => this.gestisciErrore(err)
      });
      return;
    }

    if (this.azione() === 'blocca') {

      this.cardSrv.reveal(cardId, this.pin)
        .pipe(switchMap(() => this.cardSrv.block(cardId)))
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.messaggioSuccesso.set('La carta e\' stata bloccata con successo.');
            this.completato.set(true);

            this.cardSrv.notifyChanged();
          },
          error: err => this.gestisciErrore(err)
        });
      return;
    }

    if (this.azione() === 'elimina') {

      this.cardSrv.reveal(cardId, this.pin)
        .pipe(switchMap(() => this.cardSrv.remove(cardId)))
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.messaggioSuccesso.set('La carta e\' stata eliminata con successo.');
            this.completato.set(true);
            this.cardSrv.notifyChanged();
          },
          error: err => this.gestisciErrore(err)
        });
    }
  }

  private gestisciErrore(err: HttpErrorResponse): void {
    this.loading.set(false);

    if (err.error?.error === 'InvalidCredentials') {

      this.errore.set('PIN non corretto. Dopo tre tentativi errati la carta viene bloccata.');
      return;
    }

    if (err.error?.error === 'InvalidCardStatus') {
      this.errore.set(err.error?.message ?? 'Operazione non consentita per lo stato della carta.');
      return;
    }

    this.errore.set(err.error?.message ?? 'Si e\' verificato un errore. Riprova.');
  }

    chiudi(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
