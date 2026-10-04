import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ReceiptText, ArrowLeft } from 'lucide-angular';
import { MovementService } from '../../services/movement.service';
import { ApiTransaction } from '../../services/api.model';

const TYPE_LABELS: Record<string, string> = {
  transfer: 'Bonifico',
  deposit: 'Versamento',
  withdrawal: 'Prelievo',
  card_payment: 'Pagamento con carta',
  account_opening: 'Apertura conto',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'In lavorazione',
  completed: 'Completato',
  failed: 'Non riuscito',
};

@Component({
  selector: 'app-movement-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './movement-detail.component.html',
  styleUrl: './movement-detail.component.css'
})
export class MovementDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movementSrv = inject(MovementService);

  readonly ReceiptText = ReceiptText;
  readonly ArrowLeft = ArrowLeft;

  movimento = signal<ApiTransaction | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

    importoFirmato = computed(() => {
    const m = this.movimento();

    if (!m) {
      return 0;
    }

    return m.direction === 'out' ? -m.amountEuro : m.amountEuro;
  });

  tipoLabel = computed(() => {
    const t = this.movimento()?.type;
    return t ? TYPE_LABELS[t] ?? t : '';
  });

  statoLabel = computed(() => {
    const s = this.movimento()?.status;
    return s ? STATUS_LABELS[s] ?? s : '';
  });

  direzioneLabel = computed(() =>
    this.movimento()?.direction === 'in' ? 'Entrata' : 'Uscita'
  );

    controparte = computed(() => {
    const c = this.movimento()?.counterparty;

    if (!c) {
      return null;
    }

    const nome = [c.firstName, c.lastName].filter(Boolean).join(' ');

    return { nome: nome || null, iban: c.iban ?? null };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Movimento non indicato.');
      return;
    }

    this.movementSrv.getById(id).subscribe({
      next: movimento => {
        this.movimento.set(movimento);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);

        this.errorMessage.set(
          err.status === 404
            ? 'Movimento non trovato.'
            : 'Non e\' stato possibile caricare il movimento.'
        );
      }
    });
  }

  indietro(): void {
    this.router.navigate(['/home']);
  }
}
