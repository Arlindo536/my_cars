import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Admin } from '../admin';
import { Notification } from '../../notification';

@Component({
  selector: 'app-admin-car-create',
  standalone: false,
  templateUrl: './admin-car-create.html',
  styleUrl: './admin-car-create.css'
})
export class AdminCarCreate implements OnInit {
  form: FormGroup;
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: Admin,
    private router: Router,
    private notification: Notification,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      owner_id: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      km: ['', Validators.required],
      fuel_type: ['', Validators.required],
      transmission_type: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.results;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.adminService.createCarForUser(this.form.value).subscribe({
        next: () => {
          this.notification.success('Car created successfully.');
          this.router.navigate(['/admin/cars']);
        },
        error: () => this.notification.error('Failed to create car.')
      });
    }
  }
}