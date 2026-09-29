import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Landmark, CreditCard, ArrowRightLeft, ReceiptText, ChartColumn, X } from 'lucide-angular';

interface Movimento {
  movimentoID: string;
  contoCorrenteID: string;
  data: string;
  importo: number;
  saldo: number;
  categoriaMovimentoID: string;
  descrizioneEstesa: string;
  // campi risolti lato FE tramite join con TCategorieMovimenti
  nomeCategoria: string;
  tipologiaCategoria: 'Entrata' | 'Uscita';
}

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.css'
})
export class HomeContentComponent implements OnInit {

  // Icone Lucide
  Landmark = Landmark;
  CreditCard = CreditCard;
  ArrowRightLeft = ArrowRightLeft;
  ReceiptText = ReceiptText;
  ChartColumn = ChartColumn;
  X = X;

  // Dati che in futuro verranno popolati dalla chiamata al Back-End
  saldoTotale: number = 19920000;

  ultimiMovimenti: Movimento[] = [
    {
      movimentoID: 'm1', contoCorrenteID: 'cc1', data: '2026-09-20',
      importo: -305000, saldo: 19920000, categoriaMovimentoID: 'cat1',
      descrizioneEstesa: 'Spesa Lidl', nomeCategoria: 'Spesa', tipologiaCategoria: 'Uscita'
    },
    {
      movimentoID: 'm2', contoCorrenteID: 'cc1', data: '2026-09-19',
      importo: 905000, saldo: 20225000, categoriaMovimentoID: 'cat2',
      descrizioneEstesa: 'Rimborso viaggio Taj Mahal', nomeCategoria: 'Bonifico', tipologiaCategoria: 'Entrata'
    },
    {
      movimentoID: 'm3', contoCorrenteID: 'cc1', data: '2026-09-18',
      importo: -105000, saldo: 19320000, categoriaMovimentoID: 'cat3',
      descrizioneEstesa: 'Ricarica gestore mobile', nomeCategoria: 'Ricarica telefonica', tipologiaCategoria: 'Uscita'
    },
    {
      movimentoID: 'm4', contoCorrenteID: 'cc1', data: '2026-09-17',
      importo: -105000, saldo: 19425000, categoriaMovimentoID: 'cat4',
      descrizioneEstesa: 'Utenze varie', nomeCategoria: 'Servizi', tipologiaCategoria: 'Uscita'
    },
    {
      movimentoID: 'm5', contoCorrenteID: 'cc1', data: '2026-09-16',
      importo: -105000, saldo: 19530000, categoriaMovimentoID: 'cat5',
      descrizioneEstesa: 'Sottoscrizione mensile', nomeCategoria: 'Abbonamento', tipologiaCategoria: 'Uscita'
    }
  ];

  // Movimento attualmente selezionato per il dettaglio (null = popup chiuso)
  movimentoSelezionato: Movimento | null = null;

  ngOnInit(): void {
    // Qui andrà la chiamata al service per recuperare i dati reali dal backend
  }

  apriDettaglio(m: Movimento): void {
    this.movimentoSelezionato = m;
  }

  chiudiDettaglio(): void {
    this.movimentoSelezionato = null;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}