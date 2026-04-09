import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="brand-icon">₿</span>
        <span class="brand-text">CryptoTracker</span>
      </div>

      <div class="nav-links" *ngIf="auth.isLoggedIn$ | async">
        <a routerLink="/dashboard" routerLinkActive="active">Дашборд</a>
        <a routerLink="/coins"     routerLinkActive="active">Монети</a>
      </div>

      <div class="nav-actions">
        <ng-container *ngIf="auth.isLoggedIn$ | async; else guestLinks">
          <a routerLink="/profile" class="nav-username" routerLinkActive="username-active">{{ auth.getUsername() }}</a>
          <button class="btn-logout" (click)="auth.logout()">Вийти</button>
        </ng-container>
        <ng-template #guestLinks>
          <a routerLink="/login"    class="btn-nav">Увійти</a>
          <a routerLink="/register" class="btn-nav btn-primary">Реєстрація</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0 2rem;
      height: 60px;
      background: #0f1117;
      border-bottom: 1px solid #1e2130;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.2rem;
      color: #f7931a;
    }
    .brand-icon { font-size: 1.4rem; }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }
    .nav-links a {
      color: #8b8fa8;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active { color: #e2e4f0; }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: auto;
    }
    .nav-username { color: #8b8fa8; font-size: 0.9rem; text-decoration: none; transition: color 0.2s; }
    .nav-username:hover, .nav-username.username-active { color: #f7931a; }
    .btn-logout {
      background: none;
      border: 1px solid #2d3148;
      color: #8b8fa8;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-logout:hover { border-color: #e05252; color: #e05252; }
    .btn-nav {
      color: #8b8fa8;
      text-decoration: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-nav:hover { color: #e2e4f0; }
    .btn-primary {
      background: #f7931a;
      color: #0f1117 !important;
      font-weight: 600;
    }
    .btn-primary:hover { background: #e0841a; }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
