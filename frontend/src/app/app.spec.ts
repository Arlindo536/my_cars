import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTestTranslations } from '../testing/translate';
import { App } from './app';
import { NavBar } from './nav-bar/nav-bar';
import { Footer } from './footer/footer';
import { LanguageSwitcher } from './language-switcher/language-switcher';
import { ThemeSwitcher } from './theme-switcher/theme-switcher';
import { ToastHost } from './toast-host/toast-host';
import { Notification } from './notification';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TranslatePipe],
      declarations: [App, NavBar, Footer, LanguageSwitcher, ThemeSwitcher, ToastHost],
      providers: [provideTestTranslations(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders the shell with header, main and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('header.site-header')).toBeTruthy();
    expect(el.querySelector('main.app-main')).toBeTruthy();
    expect(el.querySelector('footer.site-footer')).toBeTruthy();
  });

  it('announces toasts in a live region', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(Notification).error('Something failed');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toast-stack')!.getAttribute('aria-live')).toBe('polite');
    expect(el.querySelector('.toast-item[role="alert"]')?.textContent).toContain('Something failed');
  });
});
