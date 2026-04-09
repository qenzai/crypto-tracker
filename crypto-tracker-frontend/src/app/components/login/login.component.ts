import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">₿</span>
          <h1>Вхід до CryptoTracker</h1>
          <p>Відстежуйте крипторинок у реальному часі</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email"
                   placeholder="your@email.com"
                   [class.error]="isInvalid('email')">
            <span class="err-msg" *ngIf="isInvalid('email')">
              Введіть коректний email
            </span>
          </div>

          <div class="field">
            <label>Пароль</label>
            <input type="password" formControlName="password"
                   placeholder="••••••"
                   [class.error]="isInvalid('password')">
            <span class="err-msg" *ngIf="isInvalid('password')">
              Мінімум 6 символів
            </span>
          </div>

          <div class="server-error" *ngIf="serverError">{{ serverError }}</div>

          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Вхід...' : 'Увійти' }}
          </button>
        </form>

        <p class="auth-footer">
          Немає акаунту? <a routerLink="/register">Зареєструватись</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080b12;
    }
    .auth-card {
      background: #0f1117;
      border: 1px solid #1e2130;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-icon { font-size: 2.5rem; }
    .auth-header h1 {
      color: #e2e4f0;
      font-size: 1.5rem;
      margin: 0.5rem 0 0.3rem;
      font-weight: 600;
    }
    .auth-header p { color: #8b8fa8; font-size: 0.9rem; margin: 0; }
    .field { margin-bottom: 1.2rem; }
    .field label {
      display: block;
      color: #8b8fa8;
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
    }
    .field input {
      width: 100%;
      background: #161929;
      border: 1px solid #1e2130;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #e2e4f0;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .field input:focus { outline: none; border-color: #f7931a; }
    .field input.error { border-color: #e05252; }
    .err-msg { color: #e05252; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .server-error {
      background: rgba(224, 82, 82, 0.1);
      border: 1px solid rgba(224, 82, 82, 0.3);
      color: #e05252;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .btn-submit {
      width: 100%;
      background: #f7931a;
      border: none;
      border-radius: 8px;
      padding: 0.85rem;
      color: #0f1117;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover:not(:disabled) { background: #e0841a; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer {
      text-align: center;
      color: #8b8fa8;
      font-size: 0.9rem;
      margin-top: 1.5rem;
    }
    .auth-footer a { color: #f7931a; text-decoration: none; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  serverError = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.invalid && c.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.serverError = '';

    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.serverError = err.error?.message ?? 'Помилка входу';
        this.loading = false;
      }
    });
  }
}
