import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AuthModule } from '../auth-module';
import { provideTestTranslations } from '../../../testing/translate';

import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows inline errors instead of sending an empty form', () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();

    TestBed.inject(HttpTestingController).expectNone(() => true);
    expect(el.querySelectorAll('.field-error').length).toBe(2);
    expect(el.querySelector('#login-username')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows a loading submit button while signing in', () => {
    fixture.componentInstance.loginForm.setValue({ username: 'ana', password: 'secret' });
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    const submit = el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit.disabled).toBe(true);
    expect(submit.classList).toContain('is-loading');
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/users/login/')).flush({}, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(submit.disabled).toBe(false);
  });
});
