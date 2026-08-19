import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Notification } from '../notification';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(Notification);
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return true;
  }
  notification.error('You do not have permission to access this page.');
  router.navigate(['/cars']);
  return false;
};