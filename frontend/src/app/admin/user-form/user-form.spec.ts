import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { AdminModule } from '../admin-module';
import { provideTestTranslations } from '../../../testing/translate';

import { UserForm } from './user-form';

describe('UserForm', () => {
  let fixture: ComponentFixture<UserForm>;
  let component: UserForm;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTestTranslations(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '20' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('shows no form until the user is loaded, then fills it', async () => {
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    http.expectOne(r => r.url.endsWith('/users/admin/20/'))
      .flush({ id: 20, username: 'Ana', email: 'ana@example.com', first_name: 'Ana', last_name: 'K', role: 'customer' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(component.userForm.value).toEqual({ username: 'Ana', email: 'ana@example.com', first_name: 'Ana', last_name: 'K', role: 'customer' });
  });

  it('never offers an empty form for a missing user', async () => {
    http.expectOne(r => r.url.endsWith('/users/admin/20/')).flush({}, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Ky përdorues nuk u gjet');
  });
});
