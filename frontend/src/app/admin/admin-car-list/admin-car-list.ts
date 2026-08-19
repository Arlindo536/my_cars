import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from '../admin';
import { Car } from '../../car/car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-car-list',
  standalone: false,
  templateUrl: './admin-car-list.html',
  styleUrl: './admin-car-list.css'
})
export class AdminCarList implements OnInit {
  cars: any[] = [];

  constructor(
    private adminService: Admin,
    private carService: Car,
    private cdr: ChangeDetectorRef,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.adminService.getAllCars().subscribe({
      next: (data: any) => {
        this.cars = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load cars.')
    });
  }

  get groupedCars() {
    const groups: { owner: string; cars: any[] }[] = [];
    for (const car of this.cars) {
      let group = groups.find(g => g.owner === car.owner);
      if (!group) {
        group = { owner: car.owner, cars: [] };
        groups.push(group);
      }
      group.cars.push(car);
    }
    return groups;
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