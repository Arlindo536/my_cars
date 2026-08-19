import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: any = null;

  constructor(private userService: User, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }
}