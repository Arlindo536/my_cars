import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class User {
  private baseUrl = 'http://127.0.0.1:8000/api/users/';

  constructor(private http: HttpClient) {}

  changePassword(data: any) {
    return this.http.post(`${this.baseUrl}change-password/`, data);
  }

  updateProfile(data: any) {
    return this.http.put(`${this.baseUrl}update-profile/`, data);
  }

  deleteAccount() {
  return this.http.delete(`${this.baseUrl}delete-account/`);
}

  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  getProfile() {
  return this.http.get(`${this.baseUrl}update-profile/`);
  }
} 
