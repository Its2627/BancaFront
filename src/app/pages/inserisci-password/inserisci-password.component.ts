import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inserisci-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inserisci-password.component.html',
  styleUrl: './inserisci-password.component.css'
})
export class InserisciPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  cartaId = '';
  password = '';
  loading = false;
  errore = '';
  pinMostrato: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cartaId = params['carta'];
    });
  }

  confermaPassword(): void {
    if (!this.password) return;

    this.loading = true;
    this.errore = '';

    // Chiamata al backend inviando la password dell'account per ottenere il PIN della carta
    this.http.post<{ pin: string }>(`/api/carte/${this.cartaId}/pin`, { password: this.password })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.pinMostrato = res.pin;
        },
        error: (err) => {
          this.loading = false;
          this.errore = err.error?.message || 'Password errata o errore del server.';
        }
      });
  }

  chiudi(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}