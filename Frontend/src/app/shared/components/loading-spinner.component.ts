import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center p-8" *ngIf="loading">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    <ng-content *ngIf="!loading"></ng-content>
  `
})
export class LoadingSpinnerComponent {
  @Input() loading = false;
}
