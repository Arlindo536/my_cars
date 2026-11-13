import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AdminModule } from '../admin-module';
import { provideTestTranslations } from '../../../testing/translate';

import { UserCreate } from './user-create';

describe('UserCreate', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
  });

  it('has a show/hide button for every password field', () => {
    const fixture = TestBed.createComponent(UserCreate);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.password-toggle').length).toBe(el.querySelectorAll('.password-wrap input').length);
    expect(el.querySelectorAll('.password-toggle').length).toBeGreaterThan(0);
  });
});
