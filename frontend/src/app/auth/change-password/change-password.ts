import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../user';
import { Notification } from '../../notification';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: User,
    private notification: Notification
  ) {
    this.form = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_new_password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.userService.changePassword(this.form.value).subscribe({
        next: () => {
          this.notification.success('Password changed successfully.');
          this.form.reset();
        },
        error: (err: any) => {
          const message = err.error?.error || 'Failed to change password.';
          this.notification.error(message);
        }
      });
    }
  }
}