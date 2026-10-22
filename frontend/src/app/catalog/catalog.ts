import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CatalogCar } from '../shared/car-labels';

export interface CatalogFilters {
  search?: string;
  type?: string;
  fuel?: string;
  transmission?: string;
  ordering?: string;
  page?: number;
}

export interface CatalogPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogCar[];
}

@Injectable({
  providedIn: 'root'
})
export class Catalog {
  private apiUrl = `${environment.apiUrl}/cars/catalog/`;

  constructor(private http: HttpClient) {}

  getCars(filters: CatalogFilters) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<CatalogPage>(this.apiUrl, { params });
  }

  getCar(id: number) {
    return this.http.get<CatalogCar>(`${this.apiUrl}${id}/`);
  }
}
