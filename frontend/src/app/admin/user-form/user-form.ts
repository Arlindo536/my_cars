import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin } from '../admin';
import { Language } from '../../language';
import { Notification } from '../../notification';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
  private language = inject(Language);
  userForm: FormGroup;
  userId!: number;
  // The form only shows once the user is loaded, so an empty form can never be saved over a user
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);

  constructor(
    private fb: FormBuilder,
    private adminService: Admin,
    private route: ActivatedRoute,
    private router: Router,
    private notification: Notification
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.adminService.getUser(this.userId).subscribe({
      next: user => {
        this.userForm.patchValue(user);
        this.loading.set(false);
      },
      error: err => {
        this.notFound.set(err.status === 404);
        this.failed.set(err.status !== 404);
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    this.adminService.updateUser(this.userId, this.userForm.value).subscribe({
      next: () => {
        this.notification.success(this.language.t('users.updated'));
        this.router.navigate(['/admin/users']);
      },
      error: () => this.notification.error(this.language.t('users.updateFailed'))
    });
  }
}