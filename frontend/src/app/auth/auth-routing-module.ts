import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';
import { ChangePassword } from './change-password/change-password';
import { UpdateProfile } from './update-profile/update-profile';
import { Profile } from './profile/profile';
import { authGuard } from './auth-guard';
import { guestGuard } from './guest-guard';

const routes: Routes = [
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'change-password', component: ChangePassword, canActivate: [authGuard] },
  { path: 'update-profile', component: UpdateProfile, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}