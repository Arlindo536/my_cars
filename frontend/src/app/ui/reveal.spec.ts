import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiModule } from './ui-module';

@Component({
  selector: 'app-reveal-host',
  standalone: false,
  template: '<p appReveal>Shown</p><p class="far" appReveal>Below the fold</p>',
  styles: '.far { margin-top: 200vh; }',
})
class RevealHost {}

// The compiler needs the host in a module that imports UiModule
@NgModule({ declarations: [RevealHost], imports: [UiModule] })
class HostModule {}

describe('Reveal', () => {
  it('never hides content that is already on screen', async () => {
    await TestBed.configureTestingModule({ imports: [HostModule] }).compileComponents();
    const fixture = TestBed.createComponent(RevealHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const [onScreen] = fixture.nativeElement.querySelectorAll('p');
    expect(onScreen.classList.contains('reveal')).toBe(false);
    fixture.nativeElement.remove();
  });
});
