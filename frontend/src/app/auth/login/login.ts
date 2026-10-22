import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Notification } from '../../notification';
import { environment } from '../../../environments/environment';

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
    private route: ActivatedRoute,
    private notification: Notification
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post(`${environment.apiUrl}/users/login/`, this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            this.notification.success('Login successful.');
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
              this.router.navigateByUrl(returnUrl);
            } else if (response.role === 'admin') {
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