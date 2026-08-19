import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from '../admin';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

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
    private cdr: ChangeDetectorRef,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load users.')
    });
  }

  get admins() {
    return this.users.filter(u => u.role === 'admin');
  }

  get customers() {
    return this.users.filter(u => u.role !== 'admin');
  }

  deleteUser(id: number, username: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${username}? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteUser(id).subscribe({
          next: () => {
            this.users = this.users.filter((u: any) => u.id !== id);
            this.cdr.detectChanges();
            this.notification.success('User deleted successfully.');
          },
          error: () => this.notification.error('Failed to delete user.')
        });
      }
    });
  }
}