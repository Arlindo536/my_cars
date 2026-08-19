import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../notification';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notification: Notification
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post('http://127.0.0.1:8000/api/users/login/', this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            this.notification.success('Login successful.');
            if (response.role === 'admin') {
              this.router.navigate(['/admin/users']);
            } else {
              this.router.navigate(['/cars']);
            }
          },
          error: (err) => {
            this.notification.error('Login failed. Please check your credentials.');
          }
        });
    }
  }
}