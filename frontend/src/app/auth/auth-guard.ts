import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Notification } from '../notification';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(Notification);
  const token = localStorage.getItem('token');
  if (token) {
    return true;
  }
  notification.error('You must be logged in to access this page.');
  router.navigate(['/auth/login']);
  return false;
};