import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts$.asObservable();
  private nextId = 1;

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void   { this.show(message, 'error'); }
  info(message: string): void    { this.show(message, 'info'); }

  private show(message: string, type: ToastType): void {
    const id = this.nextId++;
    const current = this._toasts$.getValue();
    this._toasts$.next([...current, { id, message, type }]);
    // Автоматично прибираємо через 3 секунди
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number): void {
    const current = this._toasts$.getValue();
    this._toasts$.next(current.filter(t => t.id !== id));
  }
}
