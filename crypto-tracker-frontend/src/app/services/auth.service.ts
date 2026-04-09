import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'ct_token';
  private readonly USER_KEY  = 'ct_user';

  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── API calls ──────────────────────────────────────────────────────────────

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  // ── Session management ─────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).username : '';
  }

  getEmail(): string {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).email : '';
  }

  getTokenExpiry(): string {
    const token = this.getToken();
    if (!token) return '—';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000).toLocaleString('uk-UA');
    } catch { return '—'; }
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      username: res.username,
      email: res.email
    }));
    this._isLoggedIn$.next(true);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    // Перевіряємо expiry через JWT payload (base64)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
