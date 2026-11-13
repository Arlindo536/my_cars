import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTestTranslations } from '../../testing/translate';

import { NavBar } from './nav-bar';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

describe('NavBar', () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavBar, LanguageSwitcher, ThemeSwitcher],
      imports: [RouterModule.forRoot([]), TranslatePipe],
      providers: [provideTestTranslations(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('NavBar behaviour', () => {
  let fixture: ComponentFixture<NavBar>;
  let component: NavBar;

  async function create(width: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    await TestBed.configureTestingModule({
      declarations: [NavBar, LanguageSwitcher, ThemeSwitcher],
      imports: [RouterModule.forRoot([]), TranslatePipe],
      providers: [provideTestTranslations(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    document.documentElement.classList.remove('drawer-open');
  });

  it('builds initials from the stored username', async () => {
    localStorage.setItem('username', 'demo_klient');
    await create(1280);
    expect(component.initials).toBe('DK');
    localStorage.setItem('username', 'ana');
    expect(component.initials).toBe('A');
  });

  it('uses the drawer on narrow screens and for admins below 1200px', async () => {
    await create(800);
    expect(component.inline()).toBe(false);
    localStorage.setItem('role', 'admin');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1100 });
    component.onResize();
    expect(component.inline()).toBe(false);
    localStorage.setItem('role', 'customer');
    expect(component.inline()).toBe(true);
  });

  it('opens the drawer, locks page scroll and closes on Escape', async () => {
    await create(375);
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-controls="main-menu"]');
    toggle.click();
    await fixture.whenStable();
    expect(component.menuOpen()).toBe(true);
    expect(document.documentElement.classList.contains('drawer-open')).toBe(true);
    const drawer: HTMLElement = fixture.nativeElement.querySelector('#main-menu');
    expect(drawer.getAttribute('role')).toBe('dialog');
    drawer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(component.menuOpen()).toBe(false);
    expect(document.documentElement.classList.contains('drawer-open')).toBe(false);
  });

  it('logout forgets the stored username', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('role', 'customer');
    localStorage.setItem('username', 'ana');
    await create(1280);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.logout();
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
