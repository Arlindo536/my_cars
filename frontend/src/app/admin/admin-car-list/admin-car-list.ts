import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Admin } from '../admin';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminService.getAllCars().subscribe({
      next: (data: any) => {
        this.cars = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load cars', err);
      }
    });
  }
}