import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { Admin, FleetCar } from '../admin';
import { Notification } from '../../notification';
import { Language } from '../../language';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSION_TYPES } from '../../shared/car-labels';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-admin-car-form',
  standalone: false,
  templateUrl: './admin-car-form.html',
  styleUrl: './admin-car-form.css'
})
export class AdminCarForm implements OnInit, OnDestroy {
  private admin = inject(Admin);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(Notification);
  readonly language = inject(Language);

  readonly fuelOptions = FUEL_TYPES;
  readonly transmissionOptions = TRANSMISSION_TYPES;
  readonly typeOptions = CAR_TYPES;
  readonly maxYear = new Date().getFullYear() + 1;

  readonly form = inject(FormBuilder).nonNullable.group({
    model: ['', [Validators.required, Validators.maxLength(100)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1950), Validators.max(this.maxYear)]],
    km: [0, [Validators.required, Validators.min(0)]],
    fuel_type: ['', Validators.required],
    transmission_type: ['', Validators.required],
    type: ['', Validators.required],
    price_per_day: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d{1,6}(\.\d{1,2})?$/)]],
    description: [''],
  });

  readonly carId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  /** Photo currently stored on the server */
  readonly currentImage = signal<string | null>(null);
  /** Local preview of a newly picked file (object URL) */
  readonly preview = signal<string | null>(null);
  readonly imageError = signal('');
  removeImage = false;
  private pickedFile: File | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carId.set(Number(id));
      this.loading.set(true);
      this.admin.getCar(Number(id)).subscribe({
        next: car => {
          this.form.patchValue({ ...car, description: car.description ?? '' });
          this.currentImage.set(car.image);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error(this.language.t('admin.carLoadFailed'));
          this.router.navigate(['/admin/cars']);
        }
      });
    }
  }

  ngOnDestroy() {
    this.clearPreview();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) {
      return;
    }
    // Mirrors the server checks so the admin gets instant feedback
    if (!IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('admin.imageType');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('admin.imageSize');
      input.value = '';
      return;
    }
    this.clearPreview();
    this.pickedFile = file;
    this.removeImage = false;
    this.preview.set(URL.createObjectURL(file));
  }

  discardPicked(input: HTMLInputElement) {
    input.value = '';
    this.pickedFile = null;
    this.clearPreview();
  }

  save() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const data = this.form.getRawValue();
    const id = this.carId();
    const request$ = id ? this.admin.updateCar(id, data) : this.admin.createCar(data);

    request$.pipe(switchMap(car => this.syncImage(car))).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(this.language.t(id ? 'admin.carUpdated' : 'admin.carCreated'));
        this.router.navigate(['/admin/cars']);
      },
      error: err => {
        this.saving.set(false);
        const imageRejected = err?.error?.image;
        this.notification.error(this.language.t(imageRejected ? 'admin.imageRejected' : 'admin.carSaveFailed'));
      }
    });
  }

  // After the car itself is saved: upload the new photo or remove the old one
  private syncImage(car: FleetCar): Observable<unknown> {
    if (this.pickedFile) {
      return this.admin.uploadCarImage(car.id, this.pickedFile);
    }
    if (this.removeImage && car.image) {
      return this.admin.deleteCarImage(car.id);
    }
    return of(car);
  }

  private clearPreview() {
    const url = this.preview();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.preview.set(null);
  }
}
