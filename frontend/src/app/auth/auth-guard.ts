import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Notification } from '../notification';
import { Language } from '../language';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(Notification);
  const language = inject(Language);
  const token = localStorage.getItem('token');
  if (token) {
    return true;
  }
  notification.error(language.t('auth.mustLogin'));
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};