import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Admin, AdminUser } from '../admin';
import { Language } from '../../language';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail implements OnInit {
  private language = inject(Language);
  readonly user = signal<AdminUser | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);
  userId!: number;

  constructor(
    private adminService: Admin,
    private route: ActivatedRoute,
    private router: Router,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.adminService.getUser(this.userId).subscribe({
      next: user => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: err => {
        this.notFound.set(err.status === 404);
        this.failed.set(err.status !== 404);
        this.loading.set(false);
      }
    });
  }

  deleteUser() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.language.t('users.deleteTitle'),
        message: this.language.t('users.deleteMessage', { name: this.user()?.username }),
        confirmLabel: this.language.t('admin.delete'),
        cancelLabel: this.language.t('admin.cancel')
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.adminService.deleteUser(this.userId).subscribe({
          next: () => {
            this.notification.success(this.language.t('users.deleted'));
            this.router.navigate(['/admin/users']);
          },
          error: () => this.notification.error(this.language.t('users.deleteFailed'))
        });
      }
    });
  }
}