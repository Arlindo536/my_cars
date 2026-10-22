import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../user';
import { Language } from '../../language';
import { Notification } from '../../notification';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  private language = inject(Language);
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
          this.notification.success(this.language.t('profile.passwordChanged'));
          this.form.reset();
        },
        error: () => {
          this.notification.error(this.language.t('profile.passwordFailed'));
        }
      });
    }
  }
}