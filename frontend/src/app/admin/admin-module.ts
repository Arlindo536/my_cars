import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing-module';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { UserCreate } from './user-create/user-create';
import { AdminCarCreate } from './admin-car-create/admin-car-create';
import { UserDetail } from './user-detail/user-detail';

@NgModule({
  declarations: [UserList, AdminCarList, UserForm, UserCreate, AdminCarCreate, UserDetail],
  imports: [CommonModule, AdminRoutingModule, ReactiveFormsModule, FormsModule],
})
export class AdminModule {}
