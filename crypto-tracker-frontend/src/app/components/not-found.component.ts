import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, NgFor],
  template: `
    <div class="page">
      <div class="container">

        <div class="code">404</div>

        <div class="glitch-bar"></div>

        <h1 class="title">Сторінку не знайдено</h1>
        <p class="desc">
          Схоже, ця монета вже не торгується на нашій біржі —<br>
          або сторінка просто не існує.
        </p>

        <div class="actions">
          <a routerLink="/dashboard" class="btn-primary">На дашборд</a>
          <button class="btn-secondary" (click)="goBack()">← Назад</button>
        </div>

        <div class="ticker-row">
          <span class="ticker" *ngFor="let t of tickers">{{ t }}</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080b12;
      padding: 2rem;
    }

    .container {
      text-align: center;
      max-width: 520px;
    }

    .code {
      font-size: 9rem;
      font-weight: 800;
      line-height: 1;
      color: transparent;
      -webkit-text-stroke: 2px #f7931a;
      opacity: 0.35;
      letter-spacing: -4px;
      margin-bottom: 0.5rem;
      user-select: none;
    }

    .glitch-bar {
      height: 2px;
      background: linear-gradient(90deg, transparent, #f7931a, transparent);
      margin: 0 auto 1.5rem;
      width: 120px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; width: 80px; }
      50%       { opacity: 1;   width: 160px; }
    }

    .title {
      color: #e2e4f0;
      font-size: 1.6rem;
      font-weight: 600;
      margin: 0 0 0.75rem;
    }

    .desc {
      color: #8b8fa8;
      font-size: 0.95rem;
      line-height: 1.7;
      margin: 0 0 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .btn-primary {
      background: #f7931a;
      color: #0f1117;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.7rem 1.75rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #e0841a; }

    .btn-secondary {
      background: none;
      border: 1px solid #1e2130;
      color: #8b8fa8;
      font-size: 0.95rem;
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: #f7931a; color: #f7931a; }

    /* Біжучий рядок монет знизу */
    .ticker-row {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
      opacity: 0.18;
      font-size: 0.8rem;
      font-family: monospace;
      color: #8b8fa8;
      letter-spacing: 0.05em;
    }
    .ticker { white-space: nowrap; }
  `]
})
export class NotFoundComponent {
  tickers = [
    'BTC $0.00', 'ETH $0.00', 'SOL $0.00', 'BNB $0.00',
    'ADA $0.00', 'DOGE $0.00', 'XRP $0.00', 'AVAX $0.00'
  ];

  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }
}
