import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // <--- INIETTA AUTH SERVICE

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  successMessage = signal<string | null>(null);

  sendResetInstruction(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.successMessage.set('Se l\'indirizzo è registrato, riceverai una mail con le istruzioni.');
        },
        error: () => {
          this.successMessage.set('Se l\'indirizzo è registrato, riceverai una mail con le istruzioni.');
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}