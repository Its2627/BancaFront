import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Landmark, CreditCard, ArrowRightLeft, IdCard, ReceiptText, Settings, LogOut, Smartphone } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

// true = mostra Mario Rossi quando non c'è un utente loggato (senza backend)
// Quando il backend funziona, mettilo a false
const USE_MOCK_USER = true;
const MOCK_USER = { firstName: 'Mario', lastName: 'Rossi' };

@Component({
  selector: 'app-home.component',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private authSrv = inject(AuthService);
  private router = inject(Router);

  user = this.authSrv.currentUser;

  // Utente vero se presente, altrimenti (solo in modalità mock) Mario Rossi
  displayUser = computed(() => this.user() ?? (USE_MOCK_USER ? MOCK_USER : null));

  // icone
  Landmark = Landmark;
  CreditCard = CreditCard;
  ArrowRightLeft = ArrowRightLeft;
  IdCard = IdCard;
  ReceiptText = ReceiptText;
  Settings = Settings;
  LogOut = LogOut;
  Smartphone = Smartphone;

  isSelected = false;

  toggleIcon() {
    this.isSelected = !this.isSelected;
  }

  onLogout() {
    this.authSrv.logout();
    this.router.navigate(['/landing/login']);
  }
}