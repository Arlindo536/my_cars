import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../user';
import { Notification } from '../../notification';

@Component({
  selector: 'app-update-profile',
  standalone: false,
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css'
})
export class UpdateProfile implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: User,
    private notification: Notification,
    private router: Router
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.form.patchValue(data);
      }
    });
  }

  onSubmit() {
  if (this.form.valid) {
    this.userService.updateProfile(this.form.value).subscribe({
      next: () => {
        this.notification.success('Profile updated successfully.');
        this.router.navigate(['/auth/profile']);
      },
      error: () => {
        this.notification.error('Failed to update profile.');
      }
    });
  }
}
}