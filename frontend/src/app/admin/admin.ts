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

  // Fleet (admins see every car at /api/cars/)
  getFleet(page: number = 1, search: string = '') {
    return this.http.get<FleetPage>(this.carsUrl, { params: { page, search } });
  }

  getCar(id: number) {
    return this.http.get<FleetCar>(`${this.carsUrl}${id}/`);
  }

  createCar(data: FleetCarInput) {
    return this.http.post<FleetCar>(this.adminCarCreateUrl, data);
  }

  updateCar(id: number, data: FleetCarInput) {
    return this.http.put<FleetCar>(`${this.carsUrl}${id}/`, data);
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.carsUrl}${id}/`);
  }

  uploadCarImage(id: number, file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<FleetCar>(`${this.carsUrl}${id}/image/`, form);
  }

  deleteCarImage(id: number) {
    return this.http.delete<FleetCar>(`${this.carsUrl}${id}/image/`);
  }
}

export interface FleetCarInput {
  model: string;
  year: number;
  km: number;
  fuel_type: string;
  transmission_type: string;
  type: string;
  price_per_day: string;
  description: string;
}

export interface FleetCar extends FleetCarInput {
  id: number;
  owner: string;
  image: string | null;
}

export interface FleetPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: FleetCar[];
}