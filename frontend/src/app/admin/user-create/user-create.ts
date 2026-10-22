import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Language } from '../../language';
import { Notification } from '../../notification';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-create',
  standalone: false,
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate {
  private language = inject(Language);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notification: Notification
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.http.post(`${environment.apiUrl}/users/register/`, this.form.value)
        .subscribe({
          next: () => {
            this.notification.success(this.language.t('users.created'));
            this.router.navigate(['/admin/users']);
          },
          error: () => {
            this.notification.error(this.language.t('users.createFailed'));
          }
        });
    }
  }
}