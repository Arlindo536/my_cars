import { Component, signal } from '@angular/core';
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
  readonly submitting = signal(false);

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

  /** True once the user has touched an invalid field (drives aria-invalid and the inline message) */
  showError(name: string): boolean {
    const c = this.loginForm.get(name);
    return !!c && c.invalid && c.touched;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.http.post(`${environment.apiUrl}/users/login/`, this.loginForm.value).subscribe({
      next: (response: any) => {
        this.submitting.set(false);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        // Display only (initials in the nav bar); permissions still come from the token
        localStorage.setItem('username', response.username ?? '');
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
      error: () => {
        this.submitting.set(false);
        this.notification.error(this.language.t('auth.loginFailed'));
      }
    });
  }
}