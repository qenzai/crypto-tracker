import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Додаємо токен до всіх запитів (окрім login/register)
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 — токен протух, виходимо
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
