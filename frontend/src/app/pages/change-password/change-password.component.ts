import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ChangePasswordService } from '../../services/change-password.service';
import { AuthService } from '../../services/auth.service';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd === confirm ? null : { mismatch: true };
};

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private changePasswordSrv = inject(ChangePasswordService);
  private authSrv = inject(AuthService);

  form = this.fb.nonNullable.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  submitting = signal(false);
  success = signal(false);
  errorMessage = signal('');

  @HostListener('document:keydown.escape')
  close() {
    this.router.navigate(['/home/account']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.success.set(false);
    this.errorMessage.set('');

    const { oldPassword, newPassword } = this.form.getRawValue();

    this.changePasswordSrv.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.form.reset();

        this.authSrv.logout().subscribe(() => {
          setTimeout(() => this.router.navigate(['/landing/login']), 2000);
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.error === 'InvalidCredentials'
            ? 'La password attuale non è corretta.'
            : err.error?.message ?? 'Si è verificato un errore. Riprova più tardi.'
        );
      },
    });
  }
}
