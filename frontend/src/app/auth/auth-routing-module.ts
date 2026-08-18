import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';
import { ChangePassword } from './change-password/change-password';
import { UpdateProfile } from './update-profile/update-profile';

const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'change-password', component: ChangePassword },
  { path: 'update-profile', component: UpdateProfile }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}