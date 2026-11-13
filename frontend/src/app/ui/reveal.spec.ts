import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiModule } from './ui-module';

@Component({
  selector: 'app-reveal-host',
  standalone: false,
  template: '<p appReveal>Shown</p>',
})
class RevealHost {}

describe('Reveal', () => {
  it('never hides content that is already on screen', async () => {
    await TestBed.configureTestingModule({ declarations: [RevealHost], imports: [UiModule] }).compileComponents();
    const fixture = TestBed.createComponent(RevealHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.classList.contains('reveal')).toBe(false);
    fixture.nativeElement.remove();
  });
});
