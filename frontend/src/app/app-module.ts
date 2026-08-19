import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { authInterceptor } from './auth-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavBar } from './nav-bar/nav-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [App, NavBar, ConfirmDialog],
  imports: [BrowserModule, AppRoutingModule, MatDialogModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
  ],
  bootstrap: [App],
})
export class AppModule {}
