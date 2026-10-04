import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Landmark, CreditCard, ArrowRightLeft, ReceiptText, ChartColumn, X } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { MovementService, Movement } from '../../services/movement.service';
import { CardService } from '../../services/card.service';
import { ApiCard } from '../../services/api.model';
import { StatsService, TransactionStats } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

const LAST_MOVEMENTS = 5;

interface Movimento {
  movimentoID: string;
  data: string;
  importo: number;
  saldo: number;
  descrizioneEstesa: string;
  nomeCategoria: string;
  tipologiaCategoria: 'Entrata' | 'Uscita';
}

function toMovimento(m: Movement): Movimento {
  return {
    movimentoID: m.id,
    data: m.date.toISOString(),
    importo: m.amount,
    saldo: m.balanceAfter,
    descrizioneEstesa: m.description,
    nomeCategoria: m.categoryName,

    tipologiaCategoria: m.amount >= 0 ? 'Entrata' : 'Uscita',
  };
}

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.css'
})
export class HomeContentComponent implements OnInit {

  private accountSrv = inject(AccountService);
  private movementSrv = inject(MovementService);
  private cardSrv = inject(CardService);
  private statsSrv = inject(StatsService);
  private router = inject(Router);
  private authSrv = inject(AuthService);

  Landmark = Landmark;
  CreditCard = CreditCard;
  ArrowRightLeft = ArrowRightLeft;
  ReceiptText = ReceiptText;
  ChartColumn = ChartColumn;
  X = X;

    utente = this.authSrv.currentUser;

  saldoTotale = signal<number>(0);
  ultimiMovimenti = signal<Movimento[]>([]);
  cartaPrincipale = signal<ApiCard | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  stats = signal<TransactionStats | null>(null);

    topCategorie = computed(() => {
    const s = this.stats();

    if (!s || !s.totalOut) {
      return [];
    }

    return s.byCategory.slice(0, 4).map(c => ({
      nome: c.categoryName,
      totale: c.total,
      percentuale: Math.round((c.total / s.totalOut) * 100),
    }));
  });

  ngOnInit(): void {
    this.movementSrv.getLastMovements(LAST_MOVEMENTS).subscribe({
      next: result => {
        this.saldoTotale.set(result.finalBalance);
        this.ultimiMovimenti.set(result.movements.map(toMovimento));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Non e\' stato possibile caricare i dati del conto.');
      }
    });

    this.statsSrv.get()
      .pipe(catchError(() => of(null)))
      .subscribe(stats => this.stats.set(stats));

    this.cardSrv.list()
      .pipe(catchError(() => of([] as ApiCard[])))
      .subscribe(cards => {
        this.cartaPrincipale.set(cards.find(c => c.status === 'active') ?? cards[0] ?? null);
      });
  }

    apriDettaglio(m: Movimento): void {
    this.router.navigate(['/home/dettaglio-movimento', m.movimentoID]);
  }
}
