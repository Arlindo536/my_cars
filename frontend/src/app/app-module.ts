import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { authInterceptor } from './auth-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
  provideBrowserGlobalErrorListeners(),
  provideHttpClient(withInterceptors([authInterceptor]))
],
  bootstrap: [App],
})
export class AppModule {}

