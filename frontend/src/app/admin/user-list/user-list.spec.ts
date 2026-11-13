import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AdminModule } from '../admin-module';
import { provideTestTranslations } from '../../../testing/translate';

import { UserList } from './user-list';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the bulk bar only while rows are selected', async () => {
    TestBed.inject(HttpTestingController).expectOne(r => r.url.includes('/users/')).flush({
      count: 1, next: null, previous: null,
      results: [{ id: 3, username: 'ana', email: 'ana@example.com', first_name: 'Ana', last_name: 'K', role: 'customer' }],
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.bulk-bar')).toBeNull();

    // Through the UI, as a user would: "Select", then tick the row
    const selectButton = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) => b.textContent?.includes('Zgjidh'));
    selectButton.click();
    await fixture.whenStable();
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('tbody input[type="checkbox"]');
    checkbox.click();
    await fixture.whenStable();
    expect(component.selectedIds).toEqual([3]);
    expect(fixture.nativeElement.querySelector('.bulk-bar')?.textContent).toContain('1');
  });
});
