import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../car';

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
    private route: ActivatedRoute
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
        next: () => this.router.navigate(['/cars']),
        error: (err) => console.error('Update failed', err)
      });
    } else {
      this.carService.createCar(this.carForm.value).subscribe({
        next: () => this.router.navigate(['/cars']),
        error: (err) => console.error('Create failed', err)
      });
    }
  }
}