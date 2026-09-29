import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  // Saldo disponibile dell'utente
  private saldo = 100;

  // Elenco IBAN presenti in TContiCorrenti
  private contiCorrenti: string[] = [
    'IT60X0542811101000000123456',
    'IT68V0542811101000000432178',
    'IT75H0542811101000000654321',
    'IT23Y0542811101000000876543',
    'IT40Z0542811101000000998877'
  ];

  // Verifica che l'IBAN sia presente in TContiCorrenti
  esisteIBAN(iban: string): boolean {
    return this.contiCorrenti.includes(iban);
  }

  // Effettua il bonifico e aggiorna il saldo
  effettuaBonifico(iban: string, importo: number): boolean {

    // Controlla che l'importo sia valido
    // e che ci sia abbastanza saldo
    if (importo <= 0 || importo > this.saldo) {
      return false;
    }

    // Sottrae l'importo dal saldo
    this.saldo -= importo;

    return true;
  }

  // Restituisce il saldo attuale
  getSaldo(): number {
    return this.saldo;
  }
}