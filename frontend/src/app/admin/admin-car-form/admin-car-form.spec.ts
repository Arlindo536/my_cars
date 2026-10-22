import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { provideTestTranslations } from '../../../testing/translate';
import { AdminModule } from '../admin-module';

import { AdminCarForm } from './admin-car-form';

describe('AdminCarForm', () => {
  let fixture: ComponentFixture<AdminCarForm>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // The real module, so the template sees the same components as in the app
      imports: [AdminModule, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTestTranslations()],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminCarForm);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('rejects unsupported photo types before uploading', () => {
    const input = document.createElement('input');
    const file = new File(['GIF89a'], 'x.gif', { type: 'image/gif' });
    Object.defineProperty(input, 'files', { value: [file] });
    fixture.componentInstance.onFileSelected({ target: input } as unknown as Event);
    expect(fixture.componentInstance.imageError()).toBe('admin.imageType');
    expect(fixture.componentInstance.preview()).toBeNull();
  });

  it('creates the car and then uploads the picked photo', () => {
    const component = fixture.componentInstance;
    component.form.setValue({
      model: 'Fiat 500', year: 2020, km: 1000, fuel_type: 'petrol', transmission_type: 'manual',
      type: 'hatchback', price_per_day: '25.50', description: '',
    });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'p.png', { type: 'image/png' })] });
    component.onFileSelected({ target: input } as unknown as Event);

    component.save();
    const create = http.expectOne(r => r.url.endsWith('/cars/admin-create/'));
    expect(create.request.body.price_per_day).toBe('25.50');
    create.flush({ id: 9, image: null });
    const upload = http.expectOne(r => r.url.endsWith('/cars/9/image/'));
    expect(upload.request.body instanceof FormData).toBe(true);
    upload.flush({ id: 9 });
    http.verify();
  });
});
