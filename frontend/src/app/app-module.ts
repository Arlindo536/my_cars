import { NgModule, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { authInterceptor } from './auth-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavBar } from './nav-bar/nav-bar';
import { Footer } from './footer/footer';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageSwitcher } from './language-switcher/language-switcher';
import { Language } from './language';

@NgModule({
  declarations: [App, NavBar, Footer, ConfirmDialog, LanguageSwitcher],
  imports: [BrowserModule, AppRoutingModule, MatDialogModule, TranslatePipe],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideTranslateService({
      fallbackLang: 'sq',
      loader: provideTranslateHttpLoader({ prefix: 'i18n/', suffix: '.json' }),
    }),
    // Wait for the saved language's translations before the first render
    provideAppInitializer(() => inject(Language).init()),
  ],
  bootstrap: [App],
})
export class AppModule {}
