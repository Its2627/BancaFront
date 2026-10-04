import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Lock, ChevronLeft, ChevronRight, CreditCard, EyeOff } from 'lucide-angular';
import { CardService, CreateCardPayload } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
import { ApiCard, CardType } from '../../services/api.model';

const TYPE_LABELS: Record<CardType, string> = {
  debit: 'Carta di debito',
  credit: 'Carta di credito',
  prepaid: 'Carta prepagata',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Attiva',
  inactive: 'Da attivare',
  blocked: 'Bloccata',
  deleted: 'Chiusa',
};

interface Carta {
  id: string;
  tipo: string;
  titolare: string;
  numeroMascherato: string;
  scadenza: string;
  tipologia: string;
  stato: string;
  statoRaw: string;
  nome: string;
}

function formatExpiration(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, LucideAngularModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cardSrv = inject(CardService);
  private authSrv = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly Lock = Lock;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  CreditCard = CreditCard;
  readonly EyeOff = EyeOff;

  creazioneAperta = signal<boolean>(false);
  creando = signal<boolean>(false);
  erroreCreazione = signal<string>('');
  nuovaCarta = {
    name: '',
    type: 'debit' as CardType,
    pin: '',
    confirmPin: '',
    creditLimit: null as number | null,
  };

  readonly tipiCarta: { value: CardType; label: string }[] = [
    { value: 'debit', label: TYPE_LABELS.debit },
    { value: 'credit', label: TYPE_LABELS.credit },
    { value: 'prepaid', label: TYPE_LABELS.prepaid },
  ];

    cartaCreata = signal<{ cardNumber: string; cvv: string } | null>(null);

  carte = signal<Carta[]>([]);
  indiceCorrente = signal<number>(0);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  cartaCorrente = computed<Carta | null>(() => this.carte()[this.indiceCorrente()] ?? null);

  ngOnInit(): void {
    this.caricaCarte();

    this.cardSrv.changed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.caricaCarte());
  }

  caricaCarte(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cardSrv.list().subscribe({
      next: cards => {
        this.carte.set(cards.map(c => this.toCarta(c)));
        this.indiceCorrente.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Non e\' stato possibile caricare le carte.');
      }
    });
  }

  private toCarta(card: ApiCard): Carta {

    const user = this.authSrv.currentUser();
    const titolare = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '';

    return {
      id: card.id,
      tipo: TYPE_LABELS[card.type] ?? card.type,
      titolare,
      numeroMascherato: card.maskedNumber,
      scadenza: formatExpiration(card.expiration),
      tipologia: TYPE_LABELS[card.type] ?? card.type,
      stato: STATUS_LABELS[card.status] ?? card.status,
      statoRaw: card.status,
      nome: card.name,
    };
  }

  vaiCartaPrecedente(): void {
    const totale = this.carte().length;
    if (!totale) {
      return;
    }
    this.indiceCorrente.update(i => (i - 1 + totale) % totale);
  }

  vaiCartaSuccessiva(): void {
    const totale = this.carte().length;
    if (!totale) {
      return;
    }
    this.indiceCorrente.update(i => (i + 1) % totale);
  }

  vaiACarta(indice: number): void {
    this.indiceCorrente.set(indice);
  }

    vaiAPin(azione: 'blocca' | 'elimina' | 'cvv', cartaId: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['inserisci-pin'], {
      relativeTo: this.route,
      queryParams: { azione, carta: cartaId }
    });
  }

  vaiAPassword(cartaId: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['inserisci-password'], {
      relativeTo: this.route,
      queryParams: { carta: cartaId }
    });
  }

  apriCreazione(): void {
    this.creazioneAperta.set(true);
    this.erroreCreazione.set('');
    this.cartaCreata.set(null);
    this.nuovaCarta = { name: '', type: 'debit', pin: '', confirmPin: '', creditLimit: null };
  }

  chiudiCreazione(): void {
    this.creazioneAperta.set(false);
    this.cartaCreata.set(null);
  }

  get creazioneValida(): boolean {
    const c = this.nuovaCarta;

    const pinOk = /^\d{4,6}$/.test(c.pin) && c.pin === c.confirmPin;

    const plafondOk = c.type !== 'credit' || (!!c.creditLimit && c.creditLimit > 0);

    return !!c.name.trim() && pinOk && plafondOk;
  }

  creaCarta(): void {
    if (!this.creazioneValida) {
      this.erroreCreazione.set(
        this.nuovaCarta.pin !== this.nuovaCarta.confirmPin
          ? 'Il PIN e la conferma non coincidono.'
          : 'Controlla i dati: nome obbligatorio, PIN di 4-6 cifre, plafond per le carte di credito.'
      );
      return;
    }

    const payload: CreateCardPayload = {
      name: this.nuovaCarta.name.trim(),
      type: this.nuovaCarta.type,
      pin: this.nuovaCarta.pin,
      ...(this.nuovaCarta.type === 'credit'
        ? { creditLimit: Number(this.nuovaCarta.creditLimit) }
        : {}),
    };

    this.creando.set(true);
    this.erroreCreazione.set('');

    this.cardSrv.create(payload).subscribe({
      next: card => {
        this.creando.set(false);

        this.cartaCreata.set({ cardNumber: card.cardNumber, cvv: card.cvv });
        this.caricaCarte();
      },
      error: err => {
        this.creando.set(false);
        this.erroreCreazione.set(
          err.error?.message ?? 'Non e\' stato possibile creare la carta.'
        );
      }
    });
  }

    attiva(cartaId: string, event?: Event): void {
    event?.stopPropagation();

    this.cardSrv.activate(cartaId).subscribe({
      next: () => this.caricaCarte(),
      error: err => this.errorMessage.set(
        err.error?.message ?? 'Non e\' stato possibile attivare la carta.'
      )
    });
  }
}
