import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        class="toast"
        *ngFor="let toast of toastService.toasts$ | async"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        (click)="toastService.remove(toast.id)">
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
        </span>
        <span class="toast-msg">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      z-index: 9999;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      min-width: 260px;
      max-width: 380px;
      animation: slideIn 0.25s ease;
      border: 1px solid transparent;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-success { background: rgba(46,204,113,0.15); border-color: rgba(46,204,113,0.4); color: #2ecc71; }
    .toast-error   { background: rgba(224,82,82,0.15);  border-color: rgba(224,82,82,0.4);  color: #e05252; }
    .toast-info    { background: rgba(55,138,221,0.15); border-color: rgba(55,138,221,0.4); color: #378add; }
    .toast-icon { font-size: 1rem; flex-shrink: 0; }
    .toast-msg  { flex: 1; }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
