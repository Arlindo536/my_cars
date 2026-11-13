import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AuthModule } from '../auth-module';
import { provideTestTranslations } from '../../../testing/translate';

import { ChangePassword } from './change-password';

describe('ChangePassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
  });

  it('has a show/hide button for every password field', () => {
    const fixture = TestBed.createComponent(ChangePassword);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.password-toggle').length).toBe(el.querySelectorAll('.password-wrap input').length);
    expect(el.querySelectorAll('.password-toggle').length).toBeGreaterThan(0);
  });
});
