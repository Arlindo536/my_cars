import { Component, ElementRef, Input, OnDestroy, computed, signal, viewChild } from '@angular/core';

const SWIPE_PX = 40;

// Car photos: main image with crossfade, thumbnails when there are several, arrow keys and swipe,
// and a lightbox (native <dialog>: focus stays inside, Escape closes) with a 2x zoom.
// The API has one photo per car today; the component already takes a list.
@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnDestroy {
  @Input() set images(value: string[]) {
    this.list.set(value ?? []);
    this.index.set(0);
  }
  @Input() alt = '';

  readonly list = signal<string[]>([]);
  readonly index = signal(0);
  readonly zoomed = signal(false);
  readonly zoomOrigin = signal('50% 50%');
  readonly current = computed(() => this.list()[this.index()]);

  private lightbox = viewChild<ElementRef<HTMLDialogElement>>('lightbox');
  private swipeStartX: number | null = null;
  private swiped = false;

  show(i: number) {
    const count = this.list().length;
    if (count === 0) {
      return;
    }
    this.index.set((i + count) % count);
    this.zoomed.set(false);
  }

  prev() {
    this.show(this.index() - 1);
  }

  next() {
    this.show(this.index() + 1);
  }

  onKeydown(event: KeyboardEvent) {
    if (this.list().length < 2) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  onPointerDown(event: PointerEvent) {
    this.swipeStartX = event.clientX;
    this.swiped = false;
  }

  onPointerUp(event: PointerEvent) {
    if (this.swipeStartX === null) {
      return;
    }
    const dx = event.clientX - this.swipeStartX;
    this.swipeStartX = null;
    if (Math.abs(dx) > SWIPE_PX && this.list().length > 1) {
      this.swiped = true;
      dx < 0 ? this.next() : this.prev();
    }
  }

  openLightbox() {
    // A swipe ends with a click; don't open the lightbox for it
    if (this.swiped) {
      this.swiped = false;
      return;
    }
    this.zoomed.set(false);
    this.lightbox()?.nativeElement.showModal();
  }

  closeLightbox() {
    this.lightbox()?.nativeElement.close();
  }

  // Click on the photo zooms in around that point; a second click zooms out
  toggleZoom(event?: MouseEvent) {
    if (event && !this.zoomed()) {
      const box = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;
      this.zoomOrigin.set(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
    } else if (!event) {
      this.zoomOrigin.set('50% 50%');
    }
    this.zoomed.update(z => !z);
  }

  // Click on the dark area around the photo closes
  onDialogClick(event: MouseEvent) {
    if (event.target === this.lightbox()?.nativeElement) {
      this.closeLightbox();
    }
  }

  ngOnDestroy() {
    const dialog = this.lightbox()?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }
}
