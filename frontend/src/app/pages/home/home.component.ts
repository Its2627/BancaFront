import { AvatarComponent } from '../../components/avatar/avatar.component';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Landmark, CreditCard, ArrowRightLeft, IdCard, ReceiptText, Settings, LogOut, Smartphone } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home.component',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, LucideAngularModule, AvatarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private authSrv = inject(AuthService);
  private router = inject(Router);

  user = this.authSrv.currentUser;

  displayUser = this.authSrv.currentUser;

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

    this.authSrv.logout().subscribe(() => {
      this.router.navigate(['/landing/login']);
    });
  }
}
