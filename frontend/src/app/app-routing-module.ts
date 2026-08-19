import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin-guard';
import { guestGuard } from './auth/guest-guard';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'cars',
    loadChildren: () => import('./car/car-module').then(m => m.CarModule),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [authGuard, adminGuard]
  },
  { path: 'register', 
    component: Register, 
    canActivate: [guestGuard] 
  },
  { path: 'login', 
    component: Login, 
    canActivate: [guestGuard] 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}