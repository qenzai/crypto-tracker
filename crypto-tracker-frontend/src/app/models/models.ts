// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  expiresAt: string;
}

// ── Coins ─────────────────────────────────────────────────────────────────────

export interface CryptoCoin {
  id: number;
  coinGeckoId: string;
  symbol: string;
  name: string;
  isTracked: boolean;
  addedAt: string;
  latestPrice: number | null;
  priceChange24h: number | null;
}

export interface CreateCoinDto {
  coinGeckoId: string;
  symbol: string;
  name: string;
}

export interface CoinSearchResult {
  coinGeckoId: string;
  name: string;
  symbol: string;
  marketCapRank: number | null;
  thumb: string;
}

export interface UpdateCoinDto {
  name?: string;
  isTracked?: boolean;
}

// ── Prices ────────────────────────────────────────────────────────────────────

export interface CryptoPrice {
  id: number;
  cryptoCoinId: number;
  coinName: string;
  symbol: string;
  price: number;
  marketCap: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  recordedAt: string;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface PricePoint {
  recordedAt: string;
  price: number;
}

export interface CoinStats {
  coinId: number;
  coinName: string;
  symbol: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  latestPrice: number | null;
  minMarketCap: number | null;
  maxMarketCap: number | null;
  avgMarketCap: number | null;
  avgVolume24h: number | null;
  recordsCount: number;
  from: string | null;
  to: string | null;
  priceHistory: PricePoint[];
}
