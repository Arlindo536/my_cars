import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCarCreate } from './admin-car-create';

describe('AdminCarCreate', () => {
  let component: AdminCarCreate;
  let fixture: ComponentFixture<AdminCarCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCarCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCarCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
