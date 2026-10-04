import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-inserisci-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inserisci-password.component.html',
  styleUrl: './inserisci-password.component.css'
})
export class InserisciPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cardSrv = inject(CardService);

  cartaId = signal<string>('');

  password = '';
  newPin = '';
  confirmPin = '';

  loading = signal<boolean>(false);
  errore = signal<string>('');
  pinMostrato = signal<string | null>(null);

  modalitaCambio = signal<boolean>(false);
  pinCambiato = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cartaId.set(params['carta'] ?? '');
    });
  }

  confermaPassword(): void {
    if (!this.password) return;

    this.loading.set(true);
    this.errore.set('');

    this.cardSrv.revealPin(this.cartaId(), this.password).subscribe({
      next: res => {
        this.loading.set(false);
        this.pinMostrato.set(res.pin);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errore.set(
          err.error?.error === 'InvalidCredentials'
            ? 'Password non corretta.'
            : err.error?.message ?? 'Si e\' verificato un errore. Riprova.'
        );
      }
    });
  }

  apriCambioPin(): void {
    this.modalitaCambio.set(true);
    this.errore.set('');
  }

  annullaCambioPin(): void {
    this.modalitaCambio.set(false);
    this.errore.set('');
  }

  get cambioValido(): boolean {
    return /^\d{4,6}$/.test(this.newPin) && this.newPin === this.confirmPin;
  }

  cambiaPin(): void {
    const pinAttuale = this.pinMostrato();

    if (!this.cambioValido || !pinAttuale) {
      this.errore.set(
        this.newPin !== this.confirmPin
          ? 'Il nuovo PIN e la conferma non coincidono.'
          : 'Il PIN deve essere di 4-6 cifre.'
      );
      return;
    }

    this.loading.set(true);
    this.errore.set('');

    this.cardSrv.changePin(this.cartaId(), pinAttuale, this.newPin).subscribe({
      next: () => {
        this.loading.set(false);
        this.pinCambiato.set(true);
        this.pinMostrato.set(this.newPin);
        this.modalitaCambio.set(false);
        this.newPin = '';
        this.confirmPin = '';
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        this.errore.set(err.error?.message ?? 'Non e\' stato possibile cambiare il PIN.');
      }
    });
  }

  chiudi(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
