import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { TransferService } from '../../services/transfer.service';
import { MovementService, Movement } from '../../services/movement.service';
import { ContactService, Contact } from '../../services/contact.service';
import {
  LucideAngularModule,
  HandCoins,
  ArrowDown,
  ArrowUp,
  BookUser,
  ArrowRightLeft
} from 'lucide-angular';

const LAST_TRANSFERS = 5;

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent implements OnInit {

  private transferService = inject(TransferService);
  private movementService = inject(MovementService);
  private contactService = inject(ContactService);

  HandCoins = HandCoins;
  ArrowDown = ArrowDown;
  ArrowUp = ArrowUp;
  BookUser = BookUser;
  ArrowRightLeft = ArrowRightLeft;

  iban = '';

  nomeBeneficiario = '';
  cognomeBeneficiario = '';
  amount: string | number = '';
  causale = '';

  saldo = signal<number>(0);
  ultimiBonifici = signal<Movement[]>([]);
  message = signal<string>('');
  success = signal<boolean>(false);
  loading = signal<boolean>(false);

  rubrica = signal<Contact[]>([]);
  erroreRubrica = signal<string>('');

  nuovoContatto = { firstName: '', lastName: '', iban: '' };

  aggiungiAperto = signal<boolean>(false);

  ngOnInit(): void {
    this.caricaSaldo();
    this.caricaUltimiBonifici();
    this.caricaRubrica();
  }

  private caricaRubrica(): void {
    this.contactService.list()
      .pipe(catchError(() => of([] as Contact[])))
      .subscribe(contacts => this.rubrica.set(contacts));
  }

    selezionaContatto(contatto: Contact): void {
    this.nomeBeneficiario = contatto.firstName;
    this.cognomeBeneficiario = contatto.lastName;
    this.iban = contatto.iban;
  }

  toggleAggiungi(): void {
    this.aggiungiAperto.update(v => !v);
    this.erroreRubrica.set('');
  }

  get contattoValido(): boolean {
    const c = this.nuovoContatto;
    return !!c.firstName.trim() && !!c.lastName.trim() && !!c.iban.trim();
  }

  aggiungiContatto(): void {
    if (!this.contattoValido) {
      return;
    }

    this.erroreRubrica.set('');

    this.contactService.create({
      firstName: this.nuovoContatto.firstName.trim(),
      lastName: this.nuovoContatto.lastName.trim(),
      iban: this.nuovoContatto.iban.replace(/\s/g, '').toUpperCase(),
    }).subscribe({
      next: () => {
        this.nuovoContatto = { firstName: '', lastName: '', iban: '' };
        this.aggiungiAperto.set(false);
        this.caricaRubrica();
      },
      error: (err: HttpErrorResponse) => {

        this.erroreRubrica.set(err.error?.message ?? 'Impossibile salvare il contatto.');
      }
    });
  }

  rimuoviContatto(contatto: Contact, event: Event): void {
    event.stopPropagation();

    this.contactService.remove(contatto.id).subscribe({
      next: () => this.caricaRubrica(),
      error: () => this.erroreRubrica.set('Impossibile rimuovere il contatto.')
    });
  }

  private caricaSaldo(): void {
    this.transferService.getSaldo()
      .pipe(catchError(() => of(0)))
      .subscribe(saldo => this.saldo.set(saldo));
  }

    private caricaUltimiBonifici(): void {
    this.movementService.getLastMovements(LAST_TRANSFERS)
      .pipe(catchError(() => of({ movements: [], finalBalance: 0 })))
      .subscribe(result => this.ultimiBonifici.set(result.movements));
  }

  get importoNumerico(): number {

    if (
      this.amount === '' ||
      this.amount === null ||
      this.amount === undefined
    ) {
      return 0;
    }

    const valore = this.amount
      .toString()
      .replace(',', '.');

    const parsed = parseFloat(valore);

    return isNaN(parsed) ? 0 : parsed;
  }

    get saldoDopoOperazione(): number {
    return this.saldo() - this.importoNumerico;
  }

  transfer(): void {

    this.message.set('');

    const numericAmount = this.importoNumerico;

    if (
      !this.iban ||
      !this.nomeBeneficiario.trim() ||
      !this.cognomeBeneficiario.trim() ||
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {

      this.message.set('Inserisci IBAN, nome e cognome del beneficiario e un importo valido.');

      this.success.set(false);

      return;
    }

    if (!this.causale.trim()) {
      this.message.set('La causale e\' obbligatoria.');
      this.success.set(false);
      return;
    }

    const ibanPulito = this.iban
      .replace(/\s/g, '')
      .toUpperCase();

    const ibanValido =
      /^IT[0-9]{2}[A-Z][0-9A-Z]{22}$/
        .test(ibanPulito);

    if (!ibanValido) {

      this.message.set('Inserisci un IBAN italiano valido.');

      this.success.set(false);

      return;
    }

    this.loading.set(true);

    this.transferService.transfer({
      iban: ibanPulito,
      firstName: this.nomeBeneficiario.trim(),
      lastName: this.cognomeBeneficiario.trim(),
      amount: numericAmount,
      paymentReference: this.causale.trim()
    }).subscribe({
      next: () => {
        this.loading.set(false);

        this.message.set(`Bonifico di ${numericAmount.toFixed(2)} € effettuato con successo.`);

        this.success.set(true);

        this.iban = '';
        this.nomeBeneficiario = '';
        this.cognomeBeneficiario = '';
        this.amount = '';
        this.causale = '';

        this.caricaSaldo();
        this.caricaUltimiBonifici();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.success.set(false);
        this.message.set(this.messaggioErrore(err));
      }
    });
  }

    private messaggioErrore(err: HttpErrorResponse): string {
    switch (err.error?.error) {
      case 'InsufficientFunds':
        return 'Saldo insufficiente.';
      case 'InvalidRecipient':

        return err.error?.message ?? 'Destinatario non valido.';
      case 'ValidationError':
        return err.error?.message ?? 'Dati del bonifico non validi.';
      default:
        return 'Si e\' verificato un errore durante il bonifico. Riprova.';
    }
  }

  formatAmount(): void {

    if (this.amount) {

      const parsedAmount =
        parseFloat(
          this.amount
            .toString()
            .replace(',', '.')
        );

      if (!isNaN(parsedAmount)) {

        this.amount =
          parsedAmount
            .toFixed(2)
            .replace('.', ',');
      }
    }
  }
}
