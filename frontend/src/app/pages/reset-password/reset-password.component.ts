import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal<string | null>(null);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  passwordValue = signal<string>('');

  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, this.strongPasswordValidator]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordCriteria = computed(() => {
    const val = this.passwordValue();
    return {
      minLength: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    };
  });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));

    if (!this.token()) {
      this.errorMessage.set('Token non valido o mancante dall\'URL.');
    }

    this.resetPasswordForm.get('password')?.valueChanges.subscribe(val => {
      this.passwordValue.set(val || '');
    });
  }

  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value || '';
    const isValid = val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val);
    return isValid ? null : { passwordComplexity: true };
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  resetPassword(): void {
    const currentToken = this.token();

    if (this.resetPasswordForm.valid && currentToken) {
      const newPassword = this.resetPasswordForm.value.password!;

      this.authService.resetPassword(currentToken, newPassword).subscribe({
        next: () => {
          this.errorMessage.set(null);
          this.successMessage.set('Password modificata con successo! Redireziona al login...');
          setTimeout(() => this.router.navigate(['/landing/login']), 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.successMessage.set(null);
          this.errorMessage.set(err.error?.message || 'Token scaduto o non valido. Richiedi un nuovo reset.');
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
