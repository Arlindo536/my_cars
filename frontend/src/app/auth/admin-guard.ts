import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Notification } from '../notification';
import { Language } from '../language';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(Notification);
  const language = inject(Language);
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return true;
  }
  notification.error(language.t('auth.noPermission'));
  router.navigate(['/']);
  return false;
};