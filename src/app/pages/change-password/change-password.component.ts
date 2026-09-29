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

// almeno 8 caratteri, una maiuscola e un simbolo (come nella registrazione)
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

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
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.status === 400
            ? 'La password attuale non è corretta.'
            : 'Si è verificato un errore. Riprova più tardi.'
        );
      },
    });
  }
}