import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import type * as Leaflet from 'leaflet';
import { environment } from '../../../environments/environment';

// Leaflet (~150 kB) is its own chunk, fetched only when the map comes near the viewport,
// so it stays off the critical path of the pages that show it at the bottom
const loadLeaflet = () => import('leaflet').then(m => ((m as { default?: typeof Leaflet }).default ?? m) as typeof Leaflet);

@Component({
  selector: 'app-office-map',
  standalone: false,
  templateUrl: './office-map.html',
  styleUrl: './office-map.css'
})
export class OfficeMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  readonly office = environment.office;
  readonly directionsUrl =
    `https://www.openstreetmap.org/directions?route=%3B${this.office.lat}%2C${this.office.lng}`;
  readonly mapUrl =
    `https://www.openstreetmap.org/?mlat=${this.office.lat}&mlon=${this.office.lng}#map=17/${this.office.lat}/${this.office.lng}`;

  private map?: Leaflet.Map;
  private observer?: IntersectionObserver;
  private destroyed = false;

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') {
      this.createMap();
      return;
    }
    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.observer?.disconnect();
          this.createMap();
        }
      },
      { rootMargin: '400px 0px' },
    );
    this.observer.observe(this.mapEl.nativeElement);
  }

  private async createMap() {
    const L = await loadLeaflet();
    if (this.destroyed) {
      return;
    }
    // Leaflet looks for its marker images relative to the CSS by default, which breaks
    // under the Angular build; the images are copied to /leaflet (see angular.json)
    const markerIcon = L.icon({
      iconUrl: 'leaflet/marker-icon.png',
      iconRetinaUrl: 'leaflet/marker-icon-2x.png',
      shadowUrl: 'leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    const position: Leaflet.LatLngExpression = [this.office.lat, this.office.lng];
    this.map = L.map(this.mapEl.nativeElement, {
      center: position,
      zoom: 16,
      scrollWheelZoom: false, // don't hijack page scrolling
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    L.marker(position, { icon: markerIcon, alt: this.office.name, keyboard: false })
      .addTo(this.map)
      .bindPopup(`<strong>${this.office.name}</strong><br>${this.office.address}`);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.observer?.disconnect();
    this.map?.remove();
  }
}
