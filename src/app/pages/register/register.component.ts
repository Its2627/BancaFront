import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  registerForm = this.fb.group({
    nome: ['', [Validators.required]],
    cognome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/(?=.*[A-Z])(?=.*[^\w\s])/)]],
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
    if (this.registerForm.valid) {
      console.log('Registrazione inviata:', this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}