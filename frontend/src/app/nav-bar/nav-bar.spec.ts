import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTestTranslations } from '../../testing/translate';

import { NavBar } from './nav-bar';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

describe('NavBar', () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavBar, LanguageSwitcher],
      imports: [RouterModule.forRoot([]), TranslatePipe],
      providers: [provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
