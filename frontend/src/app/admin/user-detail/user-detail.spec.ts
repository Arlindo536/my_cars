import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { AdminModule } from '../admin-module';
import { provideTestTranslations } from '../../../testing/translate';

import { UserDetail } from './user-detail';

describe('UserDetail', () => {
  let fixture: ComponentFixture<UserDetail>;
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
    fixture = TestBed.createComponent(UserDetail);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('loads the user by id (not from the first list page)', async () => {
    const req = http.expectOne(r => r.url.endsWith('/users/admin/20/'));
    expect(req.request.method).toBe('GET');
    req.flush({ id: 20, username: 'Ana', email: 'ana@example.com', first_name: 'Ana', last_name: 'K', role: 'customer' });
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Ana');
    expect(el.textContent).toContain('ana@example.com');
    http.verify();
  });

  it('shows a not-found state with a heading for an unknown id', async () => {
    http.expectOne(r => r.url.endsWith('/users/admin/20/')).flush({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Ky përdorues nuk u gjet');
  });
});
