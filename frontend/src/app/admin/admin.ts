import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Admin {
  private usersUrl = 'http://127.0.0.1:8000/api/users/all/';
  private carsUrl = 'http://127.0.0.1:8000/api/cars/';

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get(this.usersUrl);
  }

  getAllCars() {
    return this.http.get(this.carsUrl);
  }
}