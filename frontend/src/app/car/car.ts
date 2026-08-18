import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Car {
  private apiUrl = 'http://127.0.0.1:8000/api/cars/';

  constructor(private http: HttpClient) {}

  getCars() {
    return this.http.get(this.apiUrl);
  }

  getCar(id: number) {
    return this.http.get(`${this.apiUrl}${id}/`);
  }

  createCar(carData: any) {
    return this.http.post(this.apiUrl, carData);
  }

  updateCar(id: number, carData: any) {
    return this.http.put(`${this.apiUrl}${id}/`, carData);
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}