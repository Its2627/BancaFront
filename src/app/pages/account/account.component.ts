import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AccountService, Profile } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [DatePipe, RouterLink, RouterOutlet],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  private accountSrv = inject(AccountService);
  private authSrv = inject(AuthService);

  user = this.authSrv.currentUser;

  profile = signal<Profile | null>(null);
  loading = signal(true);
  error = signal(false);

  // Priorità all'utente loggato, ripiego sui dati del profilo
  nome = computed(() => this.user()?.firstName ?? this.profile()?.nomeTitolare ?? '');
  cognome = computed(() => this.user()?.lastName ?? this.profile()?.cognomeTitolare ?? '');

  ngOnInit() {
    this.accountSrv.getProfile().subscribe({
      next: (p: Profile) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}