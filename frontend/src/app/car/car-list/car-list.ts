import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Car } from '../car';
import { User } from '../../auth/user';
import { Router } from '@angular/router';

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
  private userService: User,
  private router: Router
) {}

  ngOnInit() {
    this.carService.getCars().subscribe({
      next: (data: any) => {
        this.cars = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load cars', err);
      }
    });
  }

  deleteCar(id: number) {
    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.cars = this.cars.filter(car => car.id !== id);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to delete car', err)
    });
  }

  logout() {
     this.userService.logout();
     this.router.navigate(['/auth/login']);
  }
}