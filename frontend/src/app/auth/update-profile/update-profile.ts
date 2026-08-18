import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../user';

@Component({
  selector: 'app-update-profile',
  standalone: false,
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css'
})
export class UpdateProfile {
  form: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: User,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.valid) {
      this.userService.updateProfile(this.form.value).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully.';
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update profile.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}