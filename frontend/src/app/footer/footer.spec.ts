import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTestTranslations } from '../../testing/translate';

import { Footer } from './footer';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Footer, LanguageSwitcher, ThemeSwitcher],
      imports: [TranslatePipe, RouterModule.forRoot([])],
      providers: [provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
