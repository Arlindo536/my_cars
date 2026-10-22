import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Admin {
  private usersUrl = `${environment.apiUrl}/users/all/`;
  private usersBaseUrl = `${environment.apiUrl}/users/`;
  private carsUrl = `${environment.apiUrl}/cars/`;
  private adminCarCreateUrl = `${environment.apiUrl}/cars/admin-create/`;

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, search: string = '') {
    return this.http.get(`${this.usersUrl}?page=${page}&search=${search}`);
  }

  getAllCars(page: number = 1) {
    return this.http.get(`${this.carsUrl}?page=${page}`);
  }

  getGroupedCars(page: number = 1, search: string = '') {
    return this.http.get(`${this.carsUrl}grouped/?page=${page}&search=${search}`);
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