import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../notification';
import { Language } from '../../language';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: false 
})
export class Register {
  registerForm: FormGroup;

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
      confirm_password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.http.post(`${environment.apiUrl}/users/register/`, this.registerForm.value)
        .subscribe({
          next: () => {
            this.notification.success(this.language.t('auth.registerSuccess'));
            this.router.navigate(['/auth/login']);
          },
          error: () => {
            this.notification.error(this.language.t('auth.registerFailed'));
          }
        });
    }
  }
}