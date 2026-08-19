import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../notification';

@Component({
  selector: 'app-user-create',
  standalone: false,
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate {
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
      this.http.post('http://127.0.0.1:8000/api/users/register/', this.form.value)
        .subscribe({
          next: () => {
            this.notification.success('User created successfully.');
            this.router.navigate(['/admin/users']);
          },
          error: (err) => {
            const message = err.error?.error || 'Failed to create user.';
            this.notification.error(message);
          }
        });
    }
  }
}