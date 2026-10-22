import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AdminModule } from '../admin-module';
import { provideTestTranslations } from '../../../testing/translate';

import { AdminCarList } from './admin-car-list';

describe('AdminCarList', () => {
  let fixture: ComponentFixture<AdminCarList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminCarList);
    fixture.detectChanges();
  });

  it('marks unpriced cars as hidden from the catalog', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url.endsWith('/cars/')).flush({
      count: 2, next: null, previous: null,
      results: [
        { id: 1, model: 'Golf', year: 2021, km: 1, fuel_type: 'diesel', transmission_type: 'manual', type: 'hatchback', price_per_day: '35.00', description: '', owner: 'admin', image: null },
        { id: 2, model: 'Old', year: 2010, km: 1, fuel_type: 'diesel', transmission_type: 'manual', type: 'sedan', price_per_day: '0.00', description: '', owner: 'ana', image: null },
      ],
    });
    fixture.detectChanges();
    const statuses = [...fixture.nativeElement.querySelectorAll('.status')].map((s: HTMLElement) => s.textContent!.trim());
    expect(statuses).toEqual(['Në katalog', 'E fshehur']);
  });
});
