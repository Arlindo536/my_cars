import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Car } from '../car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-car-detail',
  standalone: false,
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css'
})
export class CarDetail implements OnInit {
  car: any = null;
  carId!: number;

  constructor(
    private carService: Car,
    private route: ActivatedRoute,
    private router: Router,
    private notification: Notification,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getCar(this.carId).subscribe({
      next: (data: any) => {
        this.car = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load car details.')
    });
  }

 get backLink(): string {
  const role = localStorage.getItem('role');
  return role === 'admin' ? '/admin/cars' : '/cars';
}

  get carAge(): number {
    return this.car ? new Date().getFullYear() - this.car.year : 0;
  }

  deleteCar() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Car',
        message: `Are you sure you want to delete ${this.car.model}? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.carService.deleteCar(this.carId).subscribe({
          next: () => {
            this.notification.success('Car deleted successfully.');
            this.router.navigate(['/cars']);
          },
          error: () => this.notification.error('Failed to delete car.')
        });
      }
    });
  }
}