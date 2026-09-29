import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../services/transfer.service';
import {
  LucideAngularModule,
  HandCoins,
  ArrowDown,
  ArrowUp,
  BookUser,
  ArrowRightLeft
} from 'lucide-angular';

// Interfaccia per definire la struttura del contatto
export interface Contatto {
  nome: string;
  iban: string;
}

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent implements OnInit {

  // =========================
  // ICONE
  // =========================

  HandCoins = HandCoins;
  ArrowDown = ArrowDown;
  ArrowUp = ArrowUp;
  BookUser = BookUser;
  ArrowRightLeft = ArrowRightLeft;


  // =========================
  // DATI DEL FORM
  // =========================

  iban = '';
  beneficiario = '';
  amount: string | number = '';
  causale = '';


  // =========================
  // RUBRICA
  // =========================

  rubrica: Contatto[] = [];


  // =========================
  // MESSAGGI
  // =========================

  message = '';
  success = false;


  // =========================
  // COSTRUTTORE
  // =========================

  constructor(private transferService: TransferService) {}


  // =========================
  // INIZIALIZZAZIONE
  // =========================

  ngOnInit(): void {

    // In futuro, quando la rubrica
    // arriverà dal database:
    //
    // this.transferService.getRubrica().subscribe(data => {
    //   this.rubrica = data;
    // });

  }


  // =========================
  // SELEZIONE CONTATTO
  // =========================

  selezionaContatto(contatto: Contatto): void {
    this.beneficiario = contatto.nome;
    this.iban = contatto.iban;
  }


  // =========================
  // SALDO
  // =========================

  get saldo(): number {
    return this.transferService.getSaldo();
  }


  // =========================
  // IMPORTO NUMERICO
  // =========================

  get importoNumerico(): number {

    // Se il campo è vuoto
    if (
      this.amount === '' ||
      this.amount === null ||
      this.amount === undefined
    ) {
      return 0;
    }

    // Converte la virgola italiana in punto
    const valore = this.amount
      .toString()
      .replace(',', '.');

    const parsed = parseFloat(valore);

    // Se non è un numero valido
    return isNaN(parsed) ? 0 : parsed;
  }


  // =========================
  // SALDO DOPO IL BONIFICO
  // =========================

  get saldoDopoOperazione(): number {
    return this.saldo - this.importoNumerico;
  }


  // =========================
  // ESEGUI BONIFICO
  // =========================

  transfer(): void {

    this.message = '';

    const numericAmount = this.importoNumerico;


    // Controllo IBAN e importo
    if (
      !this.iban ||
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {

      this.message =
        'Inserisci IBAN e un importo valido.';

      this.success = false;

      return;
    }


    // Pulisce l'IBAN
    const ibanPulito = this.iban
      .replace(/\s/g, '')
      .toUpperCase();


    // Controllo IBAN italiano
    const ibanValido =
      /^IT[0-9]{2}[A-Z][0-9A-Z]{22}$/
        .test(ibanPulito);

    if (!ibanValido) {

      this.message =
        'Inserisci un IBAN italiano valido.';

      this.success = false;

      return;
    }


    // Esegue il bonifico
    const risultato =
      this.transferService.effettuaBonifico(
        ibanPulito,
        numericAmount
      );


    // Controllo saldo insufficiente
    if (!risultato) {

      this.message =
        'Saldo insufficiente.';

      this.success = false;

      return;
    }


    // Bonifico effettuato correttamente
    this.message =
      `Bonifico di ${numericAmount.toFixed(2)} € effettuato con successo.`;

    this.success = true;


    // Reset del form
    this.iban = '';
    this.beneficiario = '';
    this.amount = '';
    this.causale = '';
  }


  // =========================
  // FORMATTA IMPORTO
  // =========================

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