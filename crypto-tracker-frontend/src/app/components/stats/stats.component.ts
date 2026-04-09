import {
  Component, OnInit, AfterViewInit,
  OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CryptoService } from '../../services/crypto.service';
import { CoinStats } from '../../models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="breadcrumb">
        <a routerLink="/coins">Монети</a>
        <span>/</span>
        <span>{{ stats?.coinName ?? 'Завантаження...' }}</span>
      </div>

      <div class="controls">
        <h2>
          <span class="badge" *ngIf="stats">{{ stats.symbol }}</span>
          {{ stats?.coinName ?? '' }}
        </h2>
        <div class="date-range">
          <label>З:</label>
          <input type="datetime-local" [(ngModel)]="fromDate" (change)="loadStats()">
          <label>До:</label>
          <input type="datetime-local" [(ngModel)]="toDate" (change)="loadStats()">
          <button class="btn-reset" (click)="resetDates()">Скинути</button>
        </div>
      </div>

      <div class="loading-bar" *ngIf="loading"></div>

      <ng-container *ngIf="stats && !loading">
        <div class="stat-cards">
          <div class="stat-card">
            <span class="stat-label">Поточна ціна</span>
            <span class="stat-value primary">
              {{ (stats.latestPrice ?? 0) | number:'1.2-8' }} USD
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Середня ціна</span>
            <span class="stat-value">
              {{ stats.avgPrice | number:'1.2-4' }} USD
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Мінімум</span>
            <span class="stat-value neg">
              {{ stats.minPrice | number:'1.2-4' }} USD
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Максимум</span>
            <span class="stat-value pos">
              {{ stats.maxPrice | number:'1.2-4' }} USD
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Середній MarketCap</span>
            <span class="stat-value">
              {{ stats.avgMarketCap != null ? formatBigNum(stats.avgMarketCap) : '—' }}
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Середній обсяг 24г</span>
            <span class="stat-value">
              {{ stats.avgVolume24h != null ? formatBigNum(stats.avgVolume24h) : '—' }}
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Записів у БД</span>
            <span class="stat-value">{{ stats.recordsCount }}</span>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">Динаміка ціни (останні 100 записів)</div>
          <div class="chart-wrap" *ngIf="stats.priceHistory.length > 0; else noData">
            <canvas #priceChart></canvas>
          </div>
          <ng-template #noData>
            <p class="no-data">Недостатньо даних для графіка</p>
          </ng-template>
        </div>
      </ng-container>

      <div class="error-msg" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .breadcrumb { display: flex; gap: 0.5rem; color: #8b8fa8; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .breadcrumb a { color: #8b8fa8; text-decoration: none; }
    .breadcrumb a:hover { color: #f7931a; }
    .controls { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    h2 { display: flex; align-items: center; gap: 0.75rem; color: #e2e4f0; margin: 0; font-size: 1.5rem; }
    .badge { background: #f7931a; color: #0f1117; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; }
    .date-range { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .date-range label { color: #8b8fa8; font-size: 0.85rem; }
    .date-range input { background: #161929; border: 1px solid #1e2130; border-radius: 6px; padding: 0.4rem 0.75rem; color: #e2e4f0; font-size: 0.85rem; }
    .date-range input:focus { outline: none; border-color: #f7931a; }
    .btn-reset { background: #161929; border: 1px solid #1e2130; color: #8b8fa8; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .btn-reset:hover { border-color: #f7931a; color: #f7931a; }
    .loading-bar { height: 2px; background: linear-gradient(90deg, transparent, #f7931a, transparent); background-size: 200% 100%; animation: slide 1.5s infinite; margin-bottom: 1rem; }
    @keyframes slide { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #0f1117; border: 1px solid #1e2130; border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .stat-label { color: #8b8fa8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { color: #e2e4f0; font-size: 1.15rem; font-weight: 600; }
    .stat-value.primary { color: #f7931a; font-size: 1.3rem; }
    .stat-value.pos { color: #2ecc71; }
    .stat-value.neg { color: #e05252; }
    .chart-card { background: #0f1117; border: 1px solid #1e2130; border-radius: 12px; padding: 1.5rem; }
    .chart-title { color: #8b8fa8; font-size: 0.85rem; margin-bottom: 1rem; }
    .chart-wrap { position: relative; height: 320px; }
    .no-data { text-align: center; color: #8b8fa8; padding: 3rem; }
    .error-msg { color: #e05252; background: rgba(224,82,82,0.1); border: 1px solid rgba(224,82,82,0.3); padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; }
  `]
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('priceChart') chartRef!: ElementRef<HTMLCanvasElement>;

  stats: CoinStats | null = null;
  loading = false;
  error = '';
  coinId = 0;
  fromDate = '';
  toDate = '';
  private chart: Chart | null = null;
  private chartPending = false;

  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoService
  ) {}

  ngOnInit(): void {
    this.coinId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStats();
  }

  ngAfterViewInit(): void {
    if (this.chartPending) {
      this.renderChart();
      this.chartPending = false;
    }
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';
    const from = this.fromDate ? new Date(this.fromDate) : undefined;
    const to   = this.toDate   ? new Date(this.toDate)   : undefined;

    this.crypto.getStats(this.coinId, from, to).subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
        setTimeout(() => this.renderChart(), 50);
      },
      error: () => {
        this.error = 'Помилка завантаження статистики';
        this.loading = false;
      }
    });
  }

  resetDates(): void {
    this.fromDate = '';
    this.toDate = '';
    this.loadStats();
  }

  private renderChart(): void {
    if (!this.chartRef || !this.stats?.priceHistory.length) return;

    this.chart?.destroy();

    const labels = this.stats.priceHistory.map(p =>
      new Date(p.recordedAt).toLocaleString('uk-UA', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    );
    const data = this.stats.priceHistory.map(p => p.price);
    const symbol = this.stats.symbol;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: symbol + ' ціна (USD)',
          data,
          borderColor: '#f7931a',
          backgroundColor: 'rgba(247, 147, 26, 0.08)',
          borderWidth: 2,
          pointRadius: data.length > 50 ? 0 : 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#8b8fa8', font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: '#161929',
            borderColor: '#1e2130',
            borderWidth: 1,
            titleColor: '#e2e4f0',
            bodyColor: '#8b8fa8',
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw as number;
                return ' $' + val.toLocaleString('en-US', { minimumFractionDigits: 2 });
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#8b8fa8', maxTicksLimit: 8, font: { size: 11 } },
            grid: { color: '#1e2130' }
          },
          y: {
            ticks: {
              color: '#8b8fa8',
              font: { size: 11 },
              callback: (v) => '$' + Number(v).toLocaleString('en-US')
            },
            grid: { color: '#1e2130' }
          }
        }
      }
    };

    this.chart = new Chart(this.chartRef.nativeElement, config);
  }

  formatBigNum(n: number): string {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2)  + 'B';
    if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2)  + 'M';
    return '$' + n.toLocaleString('en-US');
  }

  ngOnDestroy(): void { this.chart?.destroy(); }
}
