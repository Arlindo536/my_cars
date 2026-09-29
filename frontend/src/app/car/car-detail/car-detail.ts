import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Car } from '../car';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-car-detail',
  standalone: false,
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css'
})
export class CarDetail implements OnInit {
  car: any = null;
  carId!: number;
  images: any[] = [];
  uploading = false;
  readonly maxImages = 8;
  readonly maxImageSizeMb = 5;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private carService: Car,
    private route: ActivatedRoute,
    private router: Router,
    private notification: Notification,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getCar(this.carId).subscribe({
      next: (data: any) => {
        this.car = data;
        this.images = data.images ?? [];
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to load car details.')
    });
  }

  get backLink(): string {
  const role = localStorage.getItem('role');
  return role === 'admin' ? '/admin/cars' : '/cars';
}

  get carAge(): number {
    return this.car ? new Date().getFullYear() - this.car.year : 0;
  }

  get primaryImageUrl(): string | null {
    return this.car?.primary_image ?? null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (this.images.length >= this.maxImages) {
      this.notification.error(`You can upload at most ${this.maxImages} images per car.`);
      return;
    }
    if (!this.allowedTypes.includes(file.type)) {
      this.notification.error('Only JPG, PNG or WEBP images are allowed.');
      return;
    }
    if (file.size > this.maxImageSizeMb * 1024 * 1024) {
      this.notification.error(`Image must be smaller than ${this.maxImageSizeMb}MB.`);
      return;
    }

    this.uploading = true;
    this.carService.uploadCarImage(this.carId, file).subscribe({
      next: (image: any) => {
        this.images.push(image);
        if (image.is_primary) {
          this.car.primary_image = image.url;
        }
        this.uploading = false;
        this.notification.success('Image uploaded.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploading = false;
        this.notification.error(err?.error?.error ?? 'Failed to upload image.');
      }
    });
  }

  setPrimary(imageId: number) {
    this.carService.setPrimaryImage(this.carId, imageId).subscribe({
      next: (updated: any) => {
        this.images = this.images.map(img => ({ ...img, is_primary: img.id === imageId }));
        this.car.primary_image = updated.url;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Failed to set primary image.')
    });
  }

  deleteImage(imageId: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { title: 'Delete Image', message: 'Remove this photo from the car?' }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      const wasPrimary = this.images.find(img => img.id === imageId)?.is_primary;
      this.carService.deleteCarImage(this.carId, imageId).subscribe({
        next: () => {
          this.images = this.images.filter(img => img.id !== imageId);
          if (wasPrimary) {
            this.car.primary_image = this.images[0]?.url ?? null;
          }
          this.notification.success('Image deleted.');
          this.cdr.detectChanges();
        },
        error: () => this.notification.error('Failed to delete image.')
      });
    });
  }

  deleteCar() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Car',
        message: `Are you sure you want to delete ${this.car.model}? This cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.carService.deleteCar(this.carId).subscribe({
          next: () => {
            this.notification.success('Car deleted successfully.');
            this.router.navigate(['/cars']);
          },
          error: () => this.notification.error('Failed to delete car.')
        });
      }
    });
  }
}
