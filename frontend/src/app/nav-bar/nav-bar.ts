import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {
  menuOpen = false;

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  // Close the mobile menu after a link or button inside it is used
  closeMenu(event: Event) {
    if ((event.target as HTMLElement).closest('a, button')) {
      this.menuOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
  }

  // Until the public catalog exists (step 3) "home" depends on the role
  goHome() {
    this.menuOpen = false;
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
    } else if (this.role === 'admin') {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/cars']);
    }
  }
}
