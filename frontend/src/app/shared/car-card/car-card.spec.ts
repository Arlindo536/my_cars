import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SharedModule } from '../shared-module';
import { CarCard } from './car-card';

describe('CarCard', () => {
  let fixture: ComponentFixture<CarCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CarCard);
    fixture.componentRef.setInput('car', {
      id: 7, model: 'VW Golf', year: 2021, km: 48000, fuel_type: 'diesel',
      transmission_type: 'manual', type: 'hatchback', price_per_day: '35.00',
      description: '', image: null,
    });
    fixture.detectChanges();
  });

  it('shows Albanian labels, price and a link to the detail page', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('VW Golf');
    expect(el.textContent).toContain('Naftë');
    expect(el.textContent).toContain('Manuale');
    expect(el.textContent).toContain('35 €');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/catalog/7');
    expect(el.querySelector('app-car-placeholder')).toBeTruthy();
  });
});
