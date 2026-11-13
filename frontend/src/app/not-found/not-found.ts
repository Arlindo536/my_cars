import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: false,
  template: `
    <div class="container-xl py-5">
      <app-empty-state illustration="lost" [level]="1" [heading]="'notFound.title' | translate" [text]="'notFound.text' | translate">
        <a routerLink="/" class="btn btn-primary">{{ 'notFound.home' | translate }}</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFound {}
