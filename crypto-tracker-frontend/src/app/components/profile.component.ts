import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Профіль</h2>
        <p class="subtitle">Інформація про ваш акаунт</p>
      </div>

      <div class="profile-grid">

        <!-- Картка акаунту -->
        <div class="card">
          <div class="card-header">
            <div class="avatar">{{ initials }}</div>
            <div>
              <div class="username">{{ username }}</div>
              <div class="useremail">{{ email }}</div>
            </div>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Ім'я користувача</span>
              <span class="info-value">{{ username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Статус</span>
              <span class="info-value active-status">Активний</span>
            </div>
            <div class="info-row">
              <span class="info-label">Токен дійсний до</span>
              <span class="info-value">{{ tokenExpiry }}</span>
            </div>
          </div>
        </div>

        <!-- Зміна пароля -->
        <div class="card">
          <div class="card-title">Змінити пароль</div>
          <form [formGroup]="pwdForm" (ngSubmit)="changePassword()">
            <div class="field">
              <label>Поточний пароль</label>
              <input type="password" formControlName="currentPassword" placeholder="••••••">
            </div>
            <div class="field">
              <label>Новий пароль</label>
              <input type="password" formControlName="newPassword" placeholder="Мінімум 6 символів"
                     [class.field-err]="isInvalid('newPassword')">
              <span class="err-msg" *ngIf="isInvalid('newPassword')">Мінімум 6 символів</span>
            </div>
            <div class="field">
              <label>Підтвердити пароль</label>
              <input type="password" formControlName="confirmPassword" placeholder="Повторіть пароль"
                     [class.field-err]="pwdForm.hasError('mismatch') && pwdForm.get('confirmPassword')?.touched">
              <span class="err-msg" *ngIf="pwdForm.hasError('mismatch') && pwdForm.get('confirmPassword')?.touched">
                Паролі не збігаються
              </span>
            </div>
            <button type="submit" class="btn-save" [disabled]="pwdForm.invalid || pwdLoading">
              {{ pwdLoading ? 'Збереження...' : 'Змінити пароль' }}
            </button>
          </form>
        </div>

        <!-- Технологічний стек -->
        <div class="card card-wide">
          <div class="card-title">Про застосунок</div>
          <div class="stack-row">
            <div class="stack-box">
              <span class="stack-num" style="color:#f7931a">CoinGecko</span>
              <span class="stack-lbl">Джерело даних</span>
            </div>
            <div class="stack-box">
              <span class="stack-num" style="color:#2ecc71">MySQL 8</span>
              <span class="stack-lbl">База даних</span>
            </div>
            <div class="stack-box">
              <span class="stack-num" style="color:#378add">.NET 8</span>
              <span class="stack-lbl">Backend API</span>
            </div>
            <div class="stack-box">
              <span class="stack-num" style="color:#c84b9e">Angular 17</span>
              <span class="stack-lbl">Frontend</span>
            </div>
            <div class="stack-box">
              <span class="stack-num" style="color:#e2e4f0">JWT</span>
              <span class="stack-lbl">Авторизація</span>
            </div>
            <div class="stack-box">
              <span class="stack-num" style="color:#e2e4f0">Chart.js</span>
              <span class="stack-lbl">Графіки</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    h2 { color: #e2e4f0; margin: 0 0 0.3rem; font-size: 1.5rem; }
    .subtitle { color: #8b8fa8; margin: 0; font-size: 0.9rem; }

    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

    .card { background: #0f1117; border: 1px solid #1e2130; border-radius: 12px; padding: 1.5rem; }
    .card-wide { grid-column: 1 / -1; }
    .card-title { color: #e2e4f0; font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; }

    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #1e2130; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(247,147,26,0.15); border: 2px solid #f7931a; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #f7931a; flex-shrink: 0; }
    .username { color: #e2e4f0; font-size: 1.1rem; font-weight: 600; }
    .useremail { color: #8b8fa8; font-size: 0.85rem; margin-top: 2px; }

    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-label { color: #8b8fa8; font-size: 0.85rem; }
    .info-value { color: #e2e4f0; font-size: 0.9rem; font-weight: 500; }
    .active-status { color: #2ecc71; }

    .field { margin-bottom: 1rem; }
    .field label { display: block; color: #8b8fa8; font-size: 0.85rem; margin-bottom: 0.4rem; }
    .field input { width: 100%; background: #161929; border: 1px solid #1e2130; border-radius: 8px; padding: 0.7rem 1rem; color: #e2e4f0; font-size: 0.9rem; box-sizing: border-box; transition: border-color 0.2s; }
    .field input:focus { outline: none; border-color: #f7931a; }
    .field input.field-err { border-color: #e05252; }
    .err-msg { color: #e05252; font-size: 0.78rem; margin-top: 0.25rem; display: block; }

    .btn-save { width: 100%; background: #f7931a; border: none; border-radius: 8px; padding: 0.75rem; color: #0f1117; font-weight: 700; font-size: 0.95rem; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; }
    .btn-save:hover:not(:disabled) { background: #e0841a; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    .stack-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
    .stack-box { background: #161929; border: 1px solid #1e2130; border-radius: 8px; padding: 1rem; text-align: center; }
    .stack-num { display: block; font-size: 1rem; font-weight: 700; margin-bottom: 0.3rem; }
    .stack-lbl { font-size: 0.75rem; color: #8b8fa8; }

    @media (max-width: 680px) {
      .profile-grid { grid-template-columns: 1fr; }
      .stack-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  username = '';
  email = '';
  initials = '';
  tokenExpiry = '';
  pwdLoading = false;
  pwdForm: FormGroup;

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.username    = this.auth.getUsername();
    this.email       = this.auth.getEmail();
    this.initials    = this.username.slice(0, 2).toUpperCase();
    this.tokenExpiry = this.auth.getTokenExpiry();
  }

  isInvalid(field: string): boolean {
    const c = this.pwdForm.get(field)!;
    return c.invalid && c.touched;
  }

  changePassword(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    this.pwdLoading = true;
    // Імітація запиту (можна підключити реальний endpoint)
    setTimeout(() => {
      this.pwdLoading = false;
      this.pwdForm.reset();
      this.toast.success('Пароль успішно змінено!');
    }, 800);
  }

  private passwordsMatch(group: FormGroup) {
    const np = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return np === cp ? null : { mismatch: true };
  }
}
