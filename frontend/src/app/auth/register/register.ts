import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../notification';

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
    private notification: Notification
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
      this.http.post('http://127.0.0.1:8000/api/users/register/', this.registerForm.value)
        .subscribe({
          next: () => {
            this.notification.success('Registration successful. Please log in.');
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            const message = err.error?.error || 'Registration failed. Please check your input.';
            this.notification.error(message);
          }
        });
    }
  }
}