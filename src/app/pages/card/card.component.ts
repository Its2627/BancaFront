import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Lock, ChevronLeft, ChevronRight, CreditCard, EyeOff } from 'lucide-angular';

interface Carta {
  id: string;
  tipo: 'Fisica' | 'Virtuale' | 'Usa e getta';
  titolare: string;
  numeroMascherato: string;
  numeroCompleto: string;
  scadenza: string;
  tipologia: string;
  cvv: string;
  nome?: string; // Proprietà opzionale per evitare errori di compilazione nel template
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideAngularModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Icone usate nel template
  readonly Lock = Lock;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  CreditCard = CreditCard;
  readonly EyeOff = EyeOff;

  /**
   * Un'unica lista di carte (fisica, virtuale, usa e getta) mostrate
   * nel carosello.
   */
  carte: Carta[] = [
    {
      id: 'principale',
      tipo: 'Fisica',
      titolare: 'ANDHIKA PUTRA',
      numeroMascherato: '•••• •••• •••• 8901',
      numeroCompleto: '5260 0123 4567 8901',
      scadenza: '12/28',
      tipologia: 'Carta di debito',
      cvv: '123'
    },
    {
      id: 'virtuale',
      tipo: 'Virtuale',
      titolare: 'ANDHIKA PUTRA',
      numeroMascherato: '•••• •••• •••• 4432',
      numeroCompleto: '5260 0198 8845 4432',
      scadenza: '11/27',
      tipologia: 'Carta virtuale',
      cvv: '456'
    },
    {
      id: 'usa-e-getta',
      tipo: 'Usa e getta',
      titolare: 'ANDHIKA PUTRA',
      numeroMascherato: '•••• •••• •••• 7788',
      numeroCompleto: '5260 0155 6677 7788',
      scadenza: '—',
      tipologia: 'Carta usa e getta',
      cvv: '789'
    }
  ];

  indiceCorrente = 0;
  cartaGirata = false;

  get cartaCorrente(): Carta {
    return this.carte[this.indiceCorrente];
  }

  vaiCartaPrecedente(): void {
    this.indiceCorrente = (this.indiceCorrente - 1 + this.carte.length) % this.carte.length;
    this.cartaGirata = false;
  }

  vaiCartaSuccessiva(): void {
    this.indiceCorrente = (this.indiceCorrente + 1) % this.carte.length;
    this.cartaGirata = false;
  }

  vaiACarta(indice: number): void {
    this.indiceCorrente = indice;
    this.cartaGirata = false;
  }

  toggleFlip(): void {
    this.cartaGirata = !this.cartaGirata;
  }

  rigeneraCartaUsaEGetta(event: Event): void {
    event.stopPropagation();
    const usaEGetta = this.carte.find(c => c.id === 'usa-e-getta');
    if (!usaEGetta) {
      return;
    }

    const nuovoNumero = this.generaNumeroCartaCasuale();
    const nuovoCvv = Math.floor(100 + Math.random() * 900).toString();

    usaEGetta.numeroCompleto = nuovoNumero;
    usaEGetta.numeroMascherato = `•••• •••• •••• ${nuovoNumero.slice(-4)}`;
    usaEGetta.cvv = nuovoCvv;
    this.cartaGirata = false;
  }

  private generaNumeroCartaCasuale(): string {
    const blocchi = Array.from({ length: 4 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString()
    );
    return blocchi.join(' ');
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

  isAuthActive(): boolean {
    return this.router.url !== '/card' && this.router.url !== '/';
  }

  closeModal(): void {
    this.router.navigate(['/card']);
  }

}