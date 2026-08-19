import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../car';
import { Notification } from '../../notification';

@Component({
  selector: 'app-car-form',
  standalone: false,
  templateUrl: './car-form.html',
  styleUrl: './car-form.css'
})
export class CarForm implements OnInit {
  carForm: FormGroup;
  isEditMode = false;
  carId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private carService: Car,
    private router: Router,
    private route: ActivatedRoute,
    private notification: Notification
  ) {
    this.carForm = this.fb.group({
      model: ['', Validators.required],
      year: ['', Validators.required],
      km: ['', Validators.required],
      fuel_type: ['', Validators.required],
      transmission_type: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.carId = Number(idParam);
      this.carService.getCar(this.carId).subscribe({
        next: (data: any) => this.carForm.patchValue(data)
      });
    }
  }

  onSubmit() {
    if (this.isEditMode && this.carId) {
      this.carService.updateCar(this.carId, this.carForm.value).subscribe({
        next: () => {
          this.notification.success('Car updated successfully.');
          this.redirectAfterSave();
        },
        error: () => this.notification.error('Failed to update car.')
      });
    } else {
      this.carService.createCar(this.carForm.value).subscribe({
        next: () => {
          this.notification.success('Car added successfully.');
          this.redirectAfterSave();
        },
        error: () => this.notification.error('Failed to add car.')
      });
    }
  }

  private redirectAfterSave() {
    const role = localStorage.getItem('role');
    this.router.navigate([role === 'admin' ? '/admin/cars' : '/cars']);
  }
}