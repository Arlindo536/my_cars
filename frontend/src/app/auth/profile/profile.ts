import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../user';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: any = null;

  constructor(
    private userService: User,
    private router: Router,
    private notification: Notification,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load profile.')
    });
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Account',
        message: 'Are you sure you want to permanently delete your account? This cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteAccount().subscribe({
          next: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.notification.success('Your account has been deleted.');
            this.router.navigate(['/auth/login']);
          },
          error: () => this.notification.error('Failed to delete account.')
        });
      }
    });
  }
}