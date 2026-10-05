import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const MIN_AGE = 18;

function maxBirthDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_AGE);
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authSrv = inject(AuthService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  readonly maxBirthDate = maxBirthDate();

  registerForm = this.fb.group({
    nome: ['', [Validators.required]],
    cognome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    confirmPassword: ['', Validators.required]},{
      validators: [this.passwordMatchValidator]

  });

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(visible => !visible);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  onRegister(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nome, cognome, email, password, birthDate } = this.registerForm.getRawValue();

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authSrv.register({
      firstName: nome!,
      lastName: cognome!,
      email: email!,
      password: password!,
      birthDate: birthDate!
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set(
          'Registrazione completata. Ti abbiamo inviato una mail di conferma: ora puoi accedere.'
        );
        setTimeout(() => this.router.navigate(['/landing/login']), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);

        this.errorMessage.set(
          err.error?.error === 'UserExists'
            ? 'Esiste gia\' un account con questa email.'
            : err.error?.message ?? 'Registrazione non riuscita. Controlla i dati inseriti.'
        );
      }
    });
  }
}
