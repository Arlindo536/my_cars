import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Admin {
  private usersUrl = 'http://127.0.0.1:8000/api/users/all/';
  private usersBaseUrl = 'http://127.0.0.1:8000/api/users/';
  private carsUrl = 'http://127.0.0.1:8000/api/cars/';
  private adminCarCreateUrl = 'http://127.0.0.1:8000/api/cars/admin-create/';

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get(this.usersUrl);
  }

  getAllCars() {
    return this.http.get(this.carsUrl);
  }

  updateUser(id: number, userData: any) {
    return this.http.put(`${this.usersBaseUrl}admin/${id}/`, userData);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.usersBaseUrl}admin/${id}/`);
  }

  createCarForUser(carData: any) {
    return this.http.post(this.adminCarCreateUrl, carData);
  }
}