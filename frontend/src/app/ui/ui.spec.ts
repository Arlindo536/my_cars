import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideTestTranslations } from '../../testing/translate';

import { UiModule } from './ui-module';

@Component({
  standalone: false,
  template: `
    <app-empty-state illustration="search" heading="Nothing here" text="Try other filters">
      <button type="button" id="action">Clear</button>
    </app-empty-state>
    <app-status-badge status="confirmed">Confirmed</app-status-badge>
    <app-skeleton variant="card" [count]="2"></app-skeleton>
    <app-field-error [control]="control" errorId="err"></app-field-error>
    <input #pw type="password" id="pw" /><button [appPasswordToggle]="pw" id="toggle"></button>
  `,
})
class Host {
  control = new FormControl('', Validators.required);
}

// The compiler needs the host in a module that imports UiModule
@NgModule({ declarations: [Host], imports: [UiModule] })
class HostModule {}

describe('UiModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostModule],
      providers: [provideTestTranslations()],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the empty state with its projected action', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('app-empty-state h2')?.textContent).toContain('Nothing here');
    expect(el.querySelector('app-empty-state #action')).toBeTruthy();
  });

  it('pairs a status with an icon', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('app-status-badge .material-icons')?.textContent).toBe('check_circle');
  });

  it('renders the requested number of skeleton cards inside a status region', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('app-skeleton [role="status"]')).toBeTruthy();
    expect(el.querySelectorAll('.sk-card').length).toBe(2);
  });

  it('shows a field error only after the field was touched', () => {
    const fixture = render();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#err')).toBeNull();
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(el.querySelector('#err')?.textContent).toContain('Kjo fushë është e detyrueshme.');
  });

  it('toggles the password visibility', () => {
    const fixture = render();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('#pw')!;
    const toggle = el.querySelector<HTMLButtonElement>('#toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    toggle.click();
    expect(input.type).toBe('password');
  });
});
