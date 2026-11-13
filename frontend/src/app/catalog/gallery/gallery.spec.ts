import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTestTranslations } from '../../../testing/translate';

import { CarPageModule } from '../car-page-module';
import { Gallery } from './gallery';

describe('Gallery', () => {
  let fixture: ComponentFixture<Gallery>;
  let gallery: Gallery;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarPageModule],
      providers: [provideRouter([]), provideTestTranslations(), provideNativeDateAdapter()],
    }).compileComponents();
    fixture = TestBed.createComponent(Gallery);
    gallery = fixture.componentInstance;
  });

  it('shows the placeholder and no controls without photos', async () => {
    fixture.componentRef.setInput('images', []);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-car-placeholder')).toBeTruthy();
    expect(el.querySelector('.stage-open')).toBeNull();
    expect(el.querySelector('.thumbs')).toBeNull();
  });

  it('moves through several photos with arrow keys and wraps around', async () => {
    fixture.componentRef.setInput('images', ['/a.jpg', '/b.jpg', '/c.jpg']);
    fixture.componentRef.setInput('alt', 'VW Golf');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement.querySelector('.gallery');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(gallery.index()).toBe(2);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(gallery.index()).toBe(0);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.thumb').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.thumb[aria-current="true"]')).toBe(fixture.nativeElement.querySelector('.thumb'));
  });

  it('a horizontal swipe changes the photo and does not open the lightbox', async () => {
    fixture.componentRef.setInput('images', ['/a.jpg', '/b.jpg']);
    await fixture.whenStable();
    gallery.onPointerDown({ clientX: 200 } as PointerEvent);
    gallery.onPointerUp({ clientX: 100 } as PointerEvent);
    expect(gallery.index()).toBe(1);
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    dialog.showModal = vi.fn();
    gallery.openLightbox();
    expect(dialog.showModal).not.toHaveBeenCalled();
    gallery.openLightbox();
    expect(dialog.showModal).toHaveBeenCalled();
  });
});
