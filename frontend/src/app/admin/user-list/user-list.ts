import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Admin } from '../admin';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  users: any[] = [];

  constructor(
    private adminService: Admin,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }
}