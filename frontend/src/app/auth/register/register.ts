import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../notification';
import { Language } from '../../language';
import { environment } from '../../../environments/environment';

// Confirmation must equal the password field next to it (the API checks it too)
function matchesPassword(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password')?.value;
  return control.value && password !== control.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: false 
})
export class Register {
  registerForm: FormGroup;
  readonly submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notification: Notification,
    private language: Language
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', [Validators.required, matchesPassword]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
    // Re-check the confirmation when the password itself changes
    this.registerForm.get('password')!.valueChanges.subscribe(() =>
      this.registerForm.get('confirm_password')!.updateValueAndValidity({ emitEvent: false }),
    );
  }

  showError(name: string): boolean {
    const c = this.registerForm.get(name);
    return !!c && c.invalid && c.touched;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.http.post(`${environment.apiUrl}/users/register/`, this.registerForm.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success(this.language.t('auth.registerSuccess'));
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error(this.language.t('auth.registerFailed'));
      }
    });
  }
}