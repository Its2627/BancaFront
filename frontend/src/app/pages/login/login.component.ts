import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

const LOGIN_TIMEOUT_SECONDS = 30;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authSrv = inject(AuthService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

    secondiRimasti = signal<number>(LOGIN_TIMEOUT_SECONDS);
  tempoScaduto = signal<boolean>(false);

  private countdown?: ReturnType<typeof setInterval>;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.avviaCountdown();
  }

  ngOnDestroy(): void {
    this.fermaCountdown();
  }

  private avviaCountdown(): void {
    this.fermaCountdown();

    this.secondiRimasti.set(LOGIN_TIMEOUT_SECONDS);
    this.tempoScaduto.set(false);

    this.countdown = setInterval(() => {
      const rimasti = this.secondiRimasti() - 1;

      if (rimasti <= 0) {
        this.scadenza();
        return;
      }

      this.secondiRimasti.set(rimasti);
    }, 1000);
  }

  private fermaCountdown(): void {
    if (this.countdown) {
      clearInterval(this.countdown);
      this.countdown = undefined;
    }
  }

    private scadenza(): void {
    this.fermaCountdown();

    this.secondiRimasti.set(0);
    this.tempoScaduto.set(true);
    this.errorMessage.set('');

    this.loginForm.reset();
  }

    riprova(): void {
    this.avviaCountdown();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  onLogin(): void {

    if (this.tempoScaduto()) {
      return;
    }

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.fermaCountdown();

    const { email, password } = this.loginForm.getRawValue();

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authSrv.login(email!, password!).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);

        this.errorMessage.set(
          err.error?.message ?? 'Si e\' verificato un errore. Riprova piu\' tardi.'
        );

        this.avviaCountdown();
      }
    });
  }
}
