import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CryptoService } from '../../services/crypto.service';
import { ToastService } from '../../services/toast.service';
import { CryptoCoin, CoinSearchResult } from '../../models/models';

@Component({
  selector: 'app-coins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Монети</h2>
          <p class="subtitle">{{ coins.length }} монет відстежується</p>
        </div>
        <button class="btn-add" (click)="openModal()">+ Додати монету</button>
      </div>

      <!-- Таблиця монет -->
      <div class="table-wrap">
        <div class="loading-bar" *ngIf="loading"></div>
        <table>
          <thead>
            <tr>
              <th>Монета</th>
              <th>Тікер</th>
              <th>CoinGecko ID</th>
              <th>Ціна (USD)</th>
              <th>24г %</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let coin of coins">
              <td class="coin-name-cell">
                <span class="badge">{{ coin.symbol }}</span>
                {{ coin.name }}
              </td>
              <td class="mono">{{ coin.symbol }}</td>
              <td class="mono dim">{{ coin.coinGeckoId }}</td>
              <td class="price">
                {{ coin.latestPrice != null ? ('$' + (coin.latestPrice | number:'1.2-2')) : '—' }}
              </td>
              <td [class.pos]="(coin.priceChange24h ?? 0) >= 0"
                  [class.neg]="(coin.priceChange24h ?? 0) < 0">
                {{ coin.priceChange24h != null
                    ? ((coin.priceChange24h >= 0 ? '+' : '') + (coin.priceChange24h | number:'1.2-2') + '%')
                    : '—' }}
              </td>
              <td>
                <span class="status" [class.on]="coin.isTracked">
                  {{ coin.isTracked ? 'Активна' : 'Вимкнена' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="toggleTracked(coin)"
                        [title]="coin.isTracked ? 'Вимкнути' : 'Увімкнути'">
                  {{ coin.isTracked ? '⏸' : '▶' }}
                </button>
                <button class="btn-icon danger" (click)="deleteCoin(coin)" title="Видалити">✕</button>
              </td>
            </tr>
            <tr *ngIf="!loading && coins.length === 0">
              <td colspan="7" class="empty-row">Монети відсутні</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модальне вікно з пошуком -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Додати монету</h3>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>

          <!-- Пошук -->
          <div class="search-wrap">
            <div class="search-field">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch($event)"
                placeholder="Пошук: Bitcoin, ETH, Solana..."
                autocomplete="off">
              <span class="search-spinner" *ngIf="searching">⟳</span>
            </div>

            <!-- Результати пошуку -->
            <div class="search-results" *ngIf="searchResults.length > 0">
              <div class="search-item" *ngFor="let r of searchResults"
                   (click)="selectSearchResult(r)">
                <img [src]="r.thumb" [alt]="r.name" class="coin-thumb"
                     onerror="this.style.display='none'">
                <div class="search-item-info">
                  <span class="search-item-name">{{ r.name }}</span>
                  <span class="search-item-sym">{{ r.symbol }}</span>
                </div>
                <span class="search-item-rank" *ngIf="r.marketCapRank">
                  #{{ r.marketCapRank }}
                </span>
                <button class="btn-pick">Вибрати</button>
              </div>
            </div>

            <div class="search-empty" *ngIf="searchQuery.length > 1 && searchResults.length === 0 && !searching">
              Нічого не знайдено
            </div>
          </div>

          <div class="divider">
            <span>або введіть вручну</span>
          </div>

          <!-- Форма ручного вводу -->
          <form [formGroup]="addForm" (ngSubmit)="addCoin()">
            <div class="field">
              <label>CoinGecko ID</label>
              <input formControlName="coinGeckoId" placeholder="наприклад: dogecoin">
              <span class="hint">Знайди монету через пошук вище або введи ID вручну</span>
            </div>
            <div class="field">
              <label>Символ (тікер)</label>
              <input formControlName="symbol" placeholder="DOGE">
            </div>
            <div class="field">
              <label>Повна назва</label>
              <input formControlName="name" placeholder="Dogecoin">
            </div>
            <div class="server-error" *ngIf="addError">{{ addError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="closeModal()">Скасувати</button>
              <button type="submit" class="btn-submit" [disabled]="addLoading || addForm.invalid">
                {{ addLoading ? 'Збереження...' : 'Додати' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    h2 { color: #e2e4f0; margin: 0 0 0.3rem; font-size: 1.5rem; }
    .subtitle { color: #8b8fa8; margin: 0; font-size: 0.9rem; }
    .btn-add { background: #f7931a; border: none; border-radius: 8px; padding: 0.6rem 1.25rem; color: #0f1117; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
    .btn-add:hover { background: #e0841a; }

    .table-wrap { background: #0f1117; border: 1px solid #1e2130; border-radius: 12px; overflow: hidden; position: relative; }
    .loading-bar { height: 2px; background: linear-gradient(90deg, transparent, #f7931a, transparent); background-size: 200% 100%; animation: slide 1.5s infinite; }
    @keyframes slide { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1px solid #1e2130; }
    th { padding: 1rem 1.25rem; text-align: left; color: #8b8fa8; font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #10131e; color: #c2c4d4; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #111420; }
    .coin-name-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 500; color: #e2e4f0; }
    .badge { background: #f7931a; color: #0f1117; font-weight: 700; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .mono { font-family: monospace; font-size: 0.85rem; }
    .dim { color: #8b8fa8; }
    .price { font-weight: 600; color: #e2e4f0; }
    .pos { color: #2ecc71; font-weight: 600; }
    .neg { color: #e05252; font-weight: 600; }
    .status { font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: #1e2130; color: #8b8fa8; }
    .status.on { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon { background: #161929; border: 1px solid #1e2130; color: #8b8fa8; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .btn-icon:hover { border-color: #f7931a; color: #f7931a; }
    .btn-icon.danger:hover { border-color: #e05252; color: #e05252; }
    .empty-row { text-align: center; color: #8b8fa8; padding: 3rem !important; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; }
    .modal { background: #0f1117; border: 1px solid #1e2130; border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .modal-header h3 { color: #e2e4f0; margin: 0; font-size: 1.1rem; }
    .btn-close { background: none; border: none; color: #8b8fa8; font-size: 1rem; cursor: pointer; transition: color 0.2s; }
    .btn-close:hover { color: #e2e4f0; }

    /* Search */
    .search-wrap { margin-bottom: 1rem; }
    .search-field { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 12px; font-size: 14px; }
    .search-field input { width: 100%; background: #161929; border: 1px solid #1e2130; border-radius: 8px; padding: 0.7rem 2.5rem; color: #e2e4f0; font-size: 0.95rem; box-sizing: border-box; transition: border-color 0.2s; }
    .search-field input:focus { outline: none; border-color: #f7931a; }
    .search-spinner { position: absolute; right: 12px; color: #f7931a; animation: spin 1s linear infinite; font-size: 18px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .search-results { background: #161929; border: 1px solid #1e2130; border-radius: 8px; margin-top: 6px; overflow: hidden; }
    .search-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #1e2130; }
    .search-item:last-child { border-bottom: none; }
    .search-item:hover { background: #1e2130; }
    .coin-thumb { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
    .search-item-info { flex: 1; }
    .search-item-name { display: block; color: #e2e4f0; font-size: 0.9rem; font-weight: 500; }
    .search-item-sym { color: #8b8fa8; font-size: 0.78rem; }
    .search-item-rank { color: #8b8fa8; font-size: 0.78rem; margin-right: 6px; }
    .btn-pick { background: rgba(247,147,26,0.15); border: 1px solid rgba(247,147,26,0.3); color: #f7931a; padding: 3px 10px; border-radius: 5px; font-size: 0.78rem; cursor: pointer; flex-shrink: 0; }
    .btn-pick:hover { background: rgba(247,147,26,0.25); }
    .search-empty { color: #8b8fa8; font-size: 0.85rem; text-align: center; padding: 0.75rem; }

    /* Divider */
    .divider { display: flex; align-items: center; gap: 10px; margin: 1rem 0; color: #8b8fa8; font-size: 0.8rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #1e2130; }

    /* Form */
    .field { margin-bottom: 1rem; }
    .field label { display: block; color: #8b8fa8; font-size: 0.85rem; margin-bottom: 0.4rem; }
    .field input { width: 100%; background: #161929; border: 1px solid #1e2130; border-radius: 8px; padding: 0.7rem 1rem; color: #e2e4f0; font-size: 0.9rem; box-sizing: border-box; }
    .field input:focus { outline: none; border-color: #f7931a; }
    .hint { color: #8b8fa8; font-size: 0.78rem; margin-top: 0.25rem; display: block; }
    .server-error { color: #e05252; background: rgba(224,82,82,0.1); border: 1px solid rgba(224,82,82,0.3); padding: 0.6rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-cancel { background: #161929; border: 1px solid #1e2130; color: #8b8fa8; padding: 0.6rem 1.25rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-submit { background: #f7931a; border: none; color: #0f1117; font-weight: 700; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class CoinsComponent implements OnInit {
  coins: CryptoCoin[] = [];
  loading = false;
  showModal = false;
  addLoading = false;
  addError = '';
  addForm: FormGroup;

  // Пошук
  searchQuery = '';
  searchResults: CoinSearchResult[] = [];
  searching = false;
  private search$ = new Subject<string>();

  constructor(private crypto: CryptoService, private fb: FormBuilder, private toast: ToastService) {
    this.addForm = this.fb.group({
      coinGeckoId: ['', Validators.required],
      symbol:      ['', Validators.required],
      name:        ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCoins();

    // Debounce пошуку — чекаємо 400мс після останнього символу
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResults = [];
          this.searching = false;
          return [];
        }
        this.searching = true;
        return this.crypto.searchCoins(query);
      })
    ).subscribe({
      next: results => {
        this.searchResults = results;
        this.searching = false;
      },
      error: () => { this.searching = false; }
    });
  }

  loadCoins(): void {
    this.loading = true;
    this.crypto.getCoins().subscribe({
      next: coins => { this.coins = coins; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  onSearch(query: string): void {
    this.search$.next(query);
  }

  // Вибрати монету з результатів пошуку — автозаповнення форми
  selectSearchResult(result: CoinSearchResult): void {
    this.addForm.patchValue({
      coinGeckoId: result.coinGeckoId,
      symbol:      result.symbol,
      name:        result.name
    });
    this.searchResults = [];
    this.searchQuery = result.name;
  }

  openModal(): void {
    this.showModal = true;
    this.addForm.reset();
    this.addError = '';
    this.searchQuery = '';
    this.searchResults = [];
  }

  closeModal(): void { this.showModal = false; }

  addCoin(): void {
    if (this.addForm.invalid) return;
    this.addLoading = true;
    this.addError = '';

    this.crypto.createCoin(this.addForm.value).subscribe({
      next: (coin) => {
        this.closeModal();
        this.loadCoins();
        this.addLoading = false;
        this.toast.success(coin.name + ' успішно додано!');
      },
      error: err => {
        this.addError = err.error?.message ?? 'Помилка додавання монети';
        this.addLoading = false;
        this.toast.error(this.addError);
      }
    });
  }

  toggleTracked(coin: CryptoCoin): void {
    this.crypto.updateCoin(coin.id, { isTracked: !coin.isTracked })
      .subscribe(() => {
        this.loadCoins();
        const msg = !coin.isTracked ? coin.name + ' увімкнено' : coin.name + ' вимкнено';
        this.toast.info(msg);
      });
  }

  deleteCoin(coin: CryptoCoin): void {
    if (!confirm('Видалити ' + coin.name + ' та всю її цінову історію?')) return;
    this.crypto.deleteCoin(coin.id).subscribe(() => {
      this.loadCoins();
      this.toast.success(coin.name + ' видалено');
    });
  }
}
