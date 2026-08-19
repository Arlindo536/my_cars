import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from '../admin';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  users: any[] = [];
  currentPage = 1;
  totalPages = 1;
  hasNext = false;
  hasPrevious = false;
  isLoading = false;
  searchTerm = '';
  selectedIds: number[] = [];
  selectMode = false;

  private readonly pageSize = 5;

  constructor(
    private adminService: Admin,
    private cdr: ChangeDetectorRef,
    private notification: Notification,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers(this.currentPage, this.searchTerm).subscribe({
      next: (data: any) => {
        this.users = data.results;
        this.hasNext = !!data.next;
        this.hasPrevious = !!data.previous;
        this.totalPages = Math.ceil(data.count / this.pageSize);
        this.selectedIds = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Failed to load users.');
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  nextPage() {
    this.currentPage++;
    this.loadUsers();
  }

  previousPage() {
    this.currentPage--;
    this.loadUsers();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get admins() {
    return this.users.filter(u => u.role === 'admin');
  }

  get customers() {
    return this.users.filter(u => u.role !== 'admin');
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
        title: 'Delete Selected Users',
        message: `Are you sure you want to delete ${this.selectedIds.length} user(s)? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        let remaining = this.selectedIds.length;
        this.selectedIds.forEach(id => {
          this.adminService.deleteUser(id).subscribe({
            next: () => {
              remaining--;
              if (remaining === 0) {
                this.notification.success('Selected users deleted successfully.');
                this.loadUsers();
              }
            },
            error: () => this.notification.error('Failed to delete some users.')
          });
        });
      }
    });
  }
}