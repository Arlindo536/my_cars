import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Catalog } from '../catalog';
import { CatalogCar } from '../../shared/car-labels';
import { Language } from '../../language';

@Component({
  selector: 'app-catalog-car-detail',
  standalone: false,
  templateUrl: './catalog-car-detail.html',
  styleUrl: './catalog-car-detail.css'
})
export class CatalogCarDetail implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);

  readonly language = inject(Language);

  readonly car = signal<CatalogCar | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.failed.set(false);
    this.catalog.getCar(id).subscribe({
      next: car => {
        this.car.set(car);
        this.loading.set(false);
      },
      error: err => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.failed.set(true);
        }
        this.loading.set(false);
      }
    });
  }
}
