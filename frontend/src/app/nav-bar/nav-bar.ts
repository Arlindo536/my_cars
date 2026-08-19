import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {
  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
  }

  goHome() {
  if (!this.isLoggedIn) {
    this.router.navigate(['/auth/login']);
  } else if (this.role === 'admin') {
    this.router.navigate(['/admin/users']);
  } else {
    this.router.navigate(['/cars']);
  }
}

}