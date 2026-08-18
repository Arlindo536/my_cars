import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../user';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  form: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: User,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_new_password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.valid) {
      this.userService.changePassword(this.form.value).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully.';
          this.form.reset();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.error || 'Failed to change password.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}