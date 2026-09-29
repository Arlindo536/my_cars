import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Car {
  private apiUrl = '/api/cars/';

  constructor(private http: HttpClient) {}

  getCars(page: number = 1, search: string = '') {
  return this.http.get(`${this.apiUrl}?page=${page}&search=${search}`);
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

  getCarImages(carId: number) {
    return this.http.get(`${this.apiUrl}${carId}/images/`);
  }

  uploadCarImage(carId: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}${carId}/images/`, formData);
  }

  setPrimaryImage(carId: number, imageId: number) {
    return this.http.patch(`${this.apiUrl}${carId}/images/${imageId}/`, {});
  }

  deleteCarImage(carId: number, imageId: number) {
    return this.http.delete(`${this.apiUrl}${carId}/images/${imageId}/`);
  }
}
