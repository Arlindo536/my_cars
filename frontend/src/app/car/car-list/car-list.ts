import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Car } from '../car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-car-list',
  standalone: false,
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarList implements OnInit {
  cars: any[] = [];

  constructor(
    private carService: Car,
    private cdr: ChangeDetectorRef,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.carService.getCars().subscribe({
      next: (data: any) => {
        this.cars = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load your cars.')
    });
  }

  deleteCar(id: number, model: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Car',
        message: `Are you sure you want to delete ${model}? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.carService.deleteCar(id).subscribe({
          next: () => {
            this.cars = this.cars.filter(car => car.id !== id);
            this.cdr.detectChanges();
            this.notification.success('Car deleted successfully.');
          },
          error: () => this.notification.error('Failed to delete car.')
        });
      }
    });
  }
}