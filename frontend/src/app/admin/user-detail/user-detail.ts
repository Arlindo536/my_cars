import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from '../admin';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail implements OnInit {
  user: any = null;
  userId!: number;

  constructor(
    private adminService: Admin,
    private route: ActivatedRoute,
    private router: Router,
    private notification: Notification,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.user = data.results.find((u: any) => u.id === this.userId);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load user.')
    });
  }

  deleteUser() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${this.user.username}? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteUser(this.userId).subscribe({
          next: () => {
            this.notification.success('User deleted successfully.');
            this.router.navigate(['/admin/users']);
          },
          error: () => this.notification.error('Failed to delete user.')
        });
      }
    });
  }
}