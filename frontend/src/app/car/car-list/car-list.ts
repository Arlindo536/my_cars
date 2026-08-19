import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Car } from '../car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-car-list',
  standalone: false,
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarList implements OnInit {
  cars: any[] = [];
  currentPage = 1;
  totalPages = 1;
  hasNext = false;
  hasPrevious = false;
  isLoading = false;
  searchTerm = '';
  selectedIds: number[] = [];

  private readonly pageSize = 10;

  constructor(
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
    this.carService.getCars(this.currentPage, this.searchTerm).subscribe({
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
        this.notification.error('Failed to load your cars.');
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

  get allSelected(): boolean {
    return this.cars.length > 0 && this.selectedIds.length === this.cars.length;
  }
  selectMode = false;

toggleSelectMode() {
  this.selectMode = !this.selectMode;
  this.selectedIds = [];
}

  toggleSelectAll(event: any) {
    this.selectedIds = event.target.checked ? this.cars.map(c => c.id) : [];
  }

  toggleSelect(id: number, event: any) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    }
  }
  
  sortColumn = '';
sortAsc = true;

sortBy(column: string) {
  if (this.sortColumn === column) {
    this.sortAsc = !this.sortAsc;
  } else {
    this.sortColumn = column;
    this.sortAsc = true;
  }
  this.cars.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];
    if (valA < valB) return this.sortAsc ? -1 : 1;
    if (valA > valB) return this.sortAsc ? 1 : -1;
    return 0;
  });
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