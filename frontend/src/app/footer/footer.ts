import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  readonly year = new Date().getFullYear();
  readonly office = environment.office;
  readonly mapUrl =
    `https://www.openstreetmap.org/?mlat=${this.office.lat}&mlon=${this.office.lng}#map=17/${this.office.lat}/${this.office.lng}`;

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }
}
