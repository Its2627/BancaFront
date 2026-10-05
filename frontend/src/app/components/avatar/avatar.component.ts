import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
  firstName = input<string | null | undefined>('');
  lastName = input<string | null | undefined>('');
  picture = input<string | null | undefined>(null);

  private immagineRotta = signal<boolean>(false);

  nomeCompleto = computed(() =>
    [this.firstName(), this.lastName()].filter(Boolean).join(' ')
  );

  iniziali = computed(() => {
    const lettere = [this.firstName(), this.lastName()]
      .map(parte => (parte ?? '').trim().charAt(0))
      .filter(Boolean)
      .join('');

    return lettere.toUpperCase() || '?';
  });

  mostraImmagine = computed(() => {
    const url = (this.picture() ?? '').trim();
    return url.length > 0 && !this.immagineRotta();
  });

  immagine = computed(() => (this.picture() ?? '').trim());

  onErroreImmagine(): void {
    this.immagineRotta.set(true);
  }
}
