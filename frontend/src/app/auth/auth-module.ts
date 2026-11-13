import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import { Register } from './register/register';
import { ChangePassword } from './change-password/change-password';
import { UpdateProfile } from './update-profile/update-profile';
import { Profile } from './profile/profile';
import { UiModule } from '../ui/ui-module';

@NgModule({
  declarations: [Login, Register, ChangePassword, UpdateProfile, Profile],
  imports: [CommonModule, AuthRoutingModule, ReactiveFormsModule, TranslatePipe, UiModule],
})
export class AuthModule {}