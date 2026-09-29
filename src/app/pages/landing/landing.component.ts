import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private router = inject(Router);

  // Ritorna true se siamo su una sottorotta (es: /landing/login, /landing/register)
  isAuthActive(): boolean {
    return this.router.url !== '/landing' && this.router.url !== '/';
  }

  closeModal(): void {
    this.router.navigate(['/landing']);
  }
}