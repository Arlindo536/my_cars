import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Admin, FleetCar } from '../admin';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { Language } from '../../language';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-car-list',
  standalone: false,
  templateUrl: './admin-car-list.html',
  styleUrl: './admin-car-list.css'
})
export class AdminCarList implements OnInit {
  private admin = inject(Admin);
  private notification = inject(Notification);
  private dialog = inject(MatDialog);
  readonly language = inject(Language);

  readonly cars = signal<FleetCar[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly selectedIds = signal<number[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / PAGE_SIZE)));
  searchTerm = '';
  selectMode = false;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.admin.getFleet(this.page(), this.searchTerm.trim()).subscribe({
      next: data => {
        this.cars.set(data.results);
        this.count.set(data.count);
        this.selectedIds.set([]);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.page.set(1);
    this.load();
  }

  goToPage(page: number) {
    this.page.set(page);
    this.load();
  }

  isListed(car: FleetCar): boolean {
    return Number(car.price_per_day) > 0;
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    this.selectedIds.set([]);
  }

  toggleSelect(id: number, checked: boolean) {
    this.selectedIds.update(ids => (checked ? [...ids, id] : ids.filter(x => x !== id)));
  }

  deleteOne(car: FleetCar) {
    this.confirmDelete([car.id], this.language.t('admin.deleteCarMessage', { model: car.model }));
  }

  deleteSelected() {
    const ids = this.selectedIds();
    this.confirmDelete(ids, this.language.t('admin.deleteCarsMessage', { count: ids.length }));
  }

  private confirmDelete(ids: number[], message: string) {
    if (!ids.length) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.language.t('admin.deleteCarTitle'),
        message,
        confirmLabel: this.language.t('admin.delete'),
        cancelLabel: this.language.t('admin.cancel'),
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      forkJoin(ids.map(id => this.admin.deleteCar(id))).subscribe({
        next: () => {
          this.notification.success(this.language.t('admin.carsDeleted'));
          this.load();
        },
        error: () => {
          this.notification.error(this.language.t('admin.carsDeleteFailed'));
          this.load();
        }
      });
    });
  }
}
