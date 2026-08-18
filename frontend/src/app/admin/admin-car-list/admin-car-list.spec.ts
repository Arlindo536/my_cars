import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCarList } from './admin-car-list';

describe('AdminCarList', () => {
  let component: AdminCarList;
  let fixture: ComponentFixture<AdminCarList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCarList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCarList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
