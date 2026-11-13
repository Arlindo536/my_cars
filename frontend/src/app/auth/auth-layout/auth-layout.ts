import { Component, Input } from '@angular/core';

// Split layout for login and register: brand panel with the road art and the three "how it works" steps,
// form on the other side (stacked on phones, where the panel shrinks to a short band).
// No demo credentials in the artwork: they stay with the form (login page).
@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css'
})
export class AuthLayout {
  @Input({ required: true }) heading!: string;
}
