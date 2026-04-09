import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CryptoCoin, CreateCoinDto, UpdateCoinDto,
  CryptoPrice, CoinStats, CoinSearchResult
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getCoins(): Observable<CryptoCoin[]> {
    return this.http.get<CryptoCoin[]>(`${this.API}/cryptocoins`);
  }

  getCoin(id: number): Observable<CryptoCoin> {
    return this.http.get<CryptoCoin>(`${this.API}/cryptocoins/${id}`);
  }

  searchCoins(query: string): Observable<CoinSearchResult[]> {
    return this.http.get<CoinSearchResult[]>(
      `${this.API}/cryptocoins/search`, { params: { q: query } }
    );
  }

  createCoin(dto: CreateCoinDto): Observable<CryptoCoin> {
    return this.http.post<CryptoCoin>(`${this.API}/cryptocoins`, dto);
  }

  updateCoin(id: number, dto: UpdateCoinDto): Observable<CryptoCoin> {
    return this.http.put<CryptoCoin>(`${this.API}/cryptocoins/${id}`, dto);
  }

  deleteCoin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/cryptocoins/${id}`);
  }

  getPrices(coinId: number, from?: Date, to?: Date, limit = 100): Observable<CryptoPrice[]> {
    let params = new HttpParams().set('limit', limit);
    if (from) params = params.set('from', from.toISOString());
    if (to)   params = params.set('to', to.toISOString());
    return this.http.get<CryptoPrice[]>(`${this.API}/coins/${coinId}/prices`, { params });
  }

  getStats(coinId: number, from?: Date, to?: Date): Observable<CoinStats> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to)   params = params.set('to', to.toISOString());
    return this.http.get<CoinStats>(`${this.API}/coins/${coinId}/stats`, { params });
  }
}
