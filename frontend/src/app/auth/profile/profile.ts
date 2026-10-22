import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../user';
import { Language } from '../../language';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private language = inject(Language);
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
      error: () => this.notification.error(this.language.t('profile.loadFailed'))
    });
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.language.t('profile.deleteAccount'),
        message: this.language.t('profile.deleteMessage'),
        confirmLabel: this.language.t('admin.delete'),
        cancelLabel: this.language.t('admin.cancel')
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteAccount().subscribe({
          next: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.notification.success(this.language.t('profile.deleted'));
            this.router.navigate(['/auth/login']);
          },
          error: () => this.notification.error(this.language.t('profile.deleteFailed'))
        });
      }
    });
  }
}