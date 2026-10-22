import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Notification } from '../../notification';
import { Language } from '../../language';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  readonly demoAccounts = environment.demoAccounts;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private notification: Notification,
    private language: Language
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginAsDemo(account: { username: string; password: string }) {
    this.loginForm.setValue({ username: account.username, password: account.password });
    this.onSubmit();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post(`${environment.apiUrl}/users/login/`, this.loginForm.value)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            this.notification.success(this.language.t('auth.loginSuccess'));
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
              this.router.navigateByUrl(returnUrl);
            } else if (response.role === 'admin') {
              this.router.navigate(['/admin/bookings']);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            this.notification.error(this.language.t('auth.loginFailed'));
          }
        });
    }
  }
}