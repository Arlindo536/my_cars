import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from '../admin';
import { Car } from '../../car/car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-car-list',
  standalone: false,
  templateUrl: './admin-car-list.html',
  styleUrl: './admin-car-list.css'
})
export class AdminCarList implements OnInit {
  cars: any[] = [];
  currentPage = 1;
  totalPages = 1;
  hasNext = false;
  hasPrevious = false;
  isLoading = false;
  searchTerm = '';
  selectedIds: number[] = [];
  selectMode = false;
  sortColumn = '';
  sortAsc = true;

  private readonly pageSize = 3;

  constructor(
    private adminService: Admin,
    private carService: Car,
    private cdr: ChangeDetectorRef,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.isLoading = true;
    this.adminService.getGroupedCars(this.currentPage, this.searchTerm).subscribe({
      next: (data: any) => {
        this.cars = data.results;
        this.hasNext = !!data.next;
        this.hasPrevious = !!data.previous;
        this.totalPages = Math.ceil(data.count / this.pageSize);
        this.selectedIds = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Failed to load cars.');
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadCars();
  }

  nextPage() {
    this.currentPage++;
    this.loadCars();
  }

  previousPage() {
    this.currentPage--;
    this.loadCars();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadCars();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
  }

  get groupedCars() {
    const groups: { owner: string; cars: any[] }[] = [];
    for (const car of this.cars) {
      let group = groups.find(g => g.owner === car.owner);
      if (!group) {
        group = { owner: car.owner, cars: [] };
        groups.push(group);
      }
      group.cars.push(car);
    }
    if (this.sortColumn) {
      groups.forEach(g => {
        g.cars.sort((a, b) => {
          const valA = a[this.sortColumn];
          const valB = b[this.sortColumn];
          if (valA < valB) return this.sortAsc ? -1 : 1;
          if (valA > valB) return this.sortAsc ? 1 : -1;
          return 0;
        });
      });
    }
    return groups;
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    this.selectedIds = [];
  }

  toggleSelect(id: number, event: any) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    }
  }

  deleteSelected() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Selected Cars',
        message: `Are you sure you want to delete ${this.selectedIds.length} car(s)? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        let remaining = this.selectedIds.length;
        this.selectedIds.forEach(id => {
          this.carService.deleteCar(id).subscribe({
            next: () => {
              remaining--;
              if (remaining === 0) {
                this.notification.success('Selected cars deleted successfully.');
                this.loadCars();
              }
            },
            error: () => this.notification.error('Failed to delete some cars.')
          });
        });
      }
    });
  }
}