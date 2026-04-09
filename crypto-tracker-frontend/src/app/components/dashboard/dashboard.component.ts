import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subject, takeUntil, startWith, switchMap } from 'rxjs';
import { CryptoService } from '../../services/crypto.service';
import { CryptoCoin } from '../../models/models';

type SortField = 'name' | 'price' | 'change';
type SortDir   = 'asc' | 'desc';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Дашборд</h2>
          <p class="subtitle">Актуальні ціни криптовалют</p>
        </div>
        <div class="refresh-info">
          <span class="dot" [class.pulse]="loading"></span>
          <span *ngIf="loading">Оновлення...</span>
          <span *ngIf="!loading">Оновлення через {{ countdown }}с</span>
        </div>
      </div>

      <!-- Зведена статистика -->
      <div class="summary-bar" *ngIf="coins.length > 0">
        <div class="summary-item">
          <span class="s-label">Всього монет</span>
          <span class="s-value">{{ coins.length }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Ростуть</span>
          <span class="s-value pos">{{ growing }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Падають</span>
          <span class="s-value neg">{{ falling }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Найбільший ріст</span>
          <span class="s-value pos" *ngIf="bestCoin">
            {{ bestCoin.symbol }} +{{ bestCoin.priceChange24h | number:'1.2-2' }}%
          </span>
        </div>
        <div class="summary-item">
          <span class="s-label">Найбільше падіння</span>
          <span class="s-value neg" *ngIf="worstCoin">
            {{ worstCoin.symbol }} {{ worstCoin.priceChange24h | number:'1.2-2' }}%
          </span>
        </div>
      </div>

      <!-- Сортування -->
      <div class="sort-bar" *ngIf="coins.length > 0">
        <span class="sort-label">Сортувати:</span>
        <button class="sort-btn" [class.active]="sortField === 'name'"
                (click)="setSort('name')">
          Назва {{ sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button class="sort-btn" [class.active]="sortField === 'price'"
                (click)="setSort('price')">
          Ціна {{ sortField === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button class="sort-btn" [class.active]="sortField === 'change'"
                (click)="setSort('change')">
          Зміна 24г {{ sortField === 'change' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
        </button>
      </div>

      <!-- Loading skeleton -->
      <div class="coins-grid" *ngIf="loading && coins.length === 0">
        <div class="coin-card skeleton" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <!-- Coins grid -->
      <div class="coins-grid" *ngIf="sortedCoins.length > 0">
        <div class="coin-card" *ngFor="let coin of sortedCoins">
          <div class="coin-header">
            <div class="coin-symbol">{{ coin.symbol }}</div>
            <span class="coin-name">{{ coin.name }}</span>
          </div>

          <div class="coin-price">
            {{ (coin.latestPrice ?? 0) | number:'1.2-2' }}
            <span class="currency">USD</span>
          </div>

          <div class="coin-change"
               [class.positive]="(coin.priceChange24h ?? 0) >= 0"
               [class.negative]="(coin.priceChange24h ?? 0) < 0">
            {{ (coin.priceChange24h ?? 0) >= 0 ? '▲' : '▼' }}
            {{ (coin.priceChange24h ?? 0) | number:'1.2-2' }}%
            <span class="change-label">24г</span>
          </div>

          <!-- Міні прогрес-бар зміни ціни -->
          <div class="change-bar-wrap">
            <div class="change-bar"
                 [class.pos-bar]="(coin.priceChange24h ?? 0) >= 0"
                 [class.neg-bar]="(coin.priceChange24h ?? 0) < 0"
                 [style.width]="getBarWidth(coin.priceChange24h)">
            </div>
          </div>

          <a [routerLink]="['/stats', coin.id]" class="btn-details">
            Детальна статистика →
          </a>
        </div>
      </div>

      <div class="empty" *ngIf="!loading && coins.length === 0">
        <p>Монети не знайдено. <a routerLink="/coins">Додати монету</a></p>
      </div>

      <div class="error-msg" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    h2 { color: #e2e4f0; margin: 0 0 0.3rem; font-size: 1.5rem; }
    .subtitle { color: #8b8fa8; margin: 0; font-size: 0.9rem; }
    .refresh-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #8b8fa8;
      font-size: 0.85rem;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #2ecc71; }
    .dot.pulse { animation: blink 1s infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* Зведена статистика */
    .summary-bar {
      display: flex;
      gap: 1rem;
      background: #0f1117;
      border: 1px solid #1e2130;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 100px;
    }
    .summary-item + .summary-item {
      border-left: 1px solid #1e2130;
      padding-left: 1rem;
    }
    .s-label { color: #8b8fa8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .s-value { color: #e2e4f0; font-size: 1.1rem; font-weight: 600; }
    .s-value.pos { color: #2ecc71; }
    .s-value.neg { color: #e05252; }

    /* Сортування */
    .sort-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .sort-label { color: #8b8fa8; font-size: 0.85rem; margin-right: 0.25rem; }
    .sort-btn {
      background: #0f1117;
      border: 1px solid #1e2130;
      color: #8b8fa8;
      padding: 0.35rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .sort-btn:hover { border-color: #f7931a; color: #f7931a; }
    .sort-btn.active { border-color: #f7931a; color: #f7931a; background: rgba(247,147,26,0.08); }

    /* Картки */
    .coins-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .coin-card {
      background: #0f1117;
      border: 1px solid #1e2130;
      border-radius: 12px;
      padding: 1.5rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .coin-card:hover { border-color: #f7931a; transform: translateY(-2px); }
    .coin-card.skeleton {
      min-height: 180px;
      background: linear-gradient(90deg, #0f1117 25%, #161929 50%, #0f1117 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .coin-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
    .coin-symbol {
      background: #f7931a; color: #0f1117;
      font-weight: 700; font-size: 0.75rem;
      padding: 0.2rem 0.6rem; border-radius: 4px;
    }
    .coin-name { color: #8b8fa8; font-size: 0.9rem; }
    .coin-price { font-size: 1.6rem; font-weight: 700; color: #e2e4f0; margin-bottom: 0.4rem; }
    .currency { font-size: 0.85rem; color: #8b8fa8; font-weight: 400; }
    .coin-change { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.6rem; }
    .coin-change.positive { color: #2ecc71; }
    .coin-change.negative { color: #e05252; }
    .change-label { font-weight: 400; color: #8b8fa8; font-size: 0.8rem; }

    /* Прогрес-бар */
    .change-bar-wrap {
      height: 4px;
      background: #1e2130;
      border-radius: 2px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .change-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.5s ease;
      min-width: 4px;
    }
    .pos-bar { background: #2ecc71; }
    .neg-bar { background: #e05252; }

    .btn-details {
      display: block; text-align: center;
      background: #161929; border: 1px solid #1e2130;
      border-radius: 8px; padding: 0.5rem;
      color: #8b8fa8; text-decoration: none;
      font-size: 0.85rem; transition: all 0.2s;
    }
    .btn-details:hover { border-color: #f7931a; color: #f7931a; }
    .empty { text-align: center; color: #8b8fa8; padding: 3rem; }
    .empty a { color: #f7931a; }
    .error-msg {
      color: #e05252; background: rgba(224,82,82,0.1);
      border: 1px solid rgba(224,82,82,0.3);
      padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  coins: CryptoCoin[] = [];
  loading = true;
  error = '';
  countdown = 30;
  sortField: SortField = 'name';
  sortDir: SortDir = 'asc';

  private destroy$ = new Subject<void>();

  constructor(private crypto: CryptoService) {}

  ngOnInit(): void {
    // Основний інтервал оновлення даних
    interval(30_000).pipe(
      startWith(0),
      switchMap(() => {
        this.loading = true;
        this.countdown = 30;
        return this.crypto.getCoins();
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: coins => {
        this.coins = coins;
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.error = 'Помилка завантаження даних';
        this.loading = false;
      }
    });

    // Таймер зворотного відліку
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.countdown > 0) this.countdown--;
    });
  }

  // ── Сортування ──────────────────────────────────────────────────────────────

  setSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = field === 'change' ? 'desc' : 'asc';
    }
  }

  get sortedCoins(): CryptoCoin[] {
    return [...this.coins].sort((a, b) => {
      let diff = 0;
      if (this.sortField === 'name')   diff = a.name.localeCompare(b.name);
      if (this.sortField === 'price')  diff = (a.latestPrice ?? 0) - (b.latestPrice ?? 0);
      if (this.sortField === 'change') diff = (a.priceChange24h ?? 0) - (b.priceChange24h ?? 0);
      return this.sortDir === 'asc' ? diff : -diff;
    });
  }

  // ── Зведена статистика ───────────────────────────────────────────────────────

  get growing(): number {
    return this.coins.filter(c => (c.priceChange24h ?? 0) >= 0).length;
  }

  get falling(): number {
    return this.coins.filter(c => (c.priceChange24h ?? 0) < 0).length;
  }

  get bestCoin(): CryptoCoin | null {
    if (!this.coins.length) return null;
    return this.coins.reduce((best, c) =>
      (c.priceChange24h ?? -Infinity) > (best.priceChange24h ?? -Infinity) ? c : best
    );
  }

  get worstCoin(): CryptoCoin | null {
    if (!this.coins.length) return null;
    return this.coins.reduce((worst, c) =>
      (c.priceChange24h ?? Infinity) < (worst.priceChange24h ?? Infinity) ? c : worst
    );
  }

  // ── Ширина прогрес-бара (макс 100%, масштаб відносно ±10%) ──────────────────

  getBarWidth(change: number | null): string {
    const val = Math.abs(change ?? 0);
    const pct = Math.min((val / 10) * 100, 100);
    return pct + '%';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
