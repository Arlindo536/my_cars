import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AuthModule } from '../auth-module';
import { provideTestTranslations } from '../../../testing/translate';

import { Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
    fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
  });

  it('flags a confirmation that does not match the password', () => {
    const form = fixture.componentInstance.registerForm;
    form.patchValue({ password: 'abc12345', confirm_password: 'abc1234' });
    expect(form.get('confirm_password')!.hasError('mismatch')).toBe(true);

    form.patchValue({ password: 'abc1234' });
    expect(form.get('confirm_password')!.valid).toBe(true);
  });
});
