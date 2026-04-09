import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'coins',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/coins/coins.component').then(m => m.CoinsComponent)
  },
  {
    path: 'stats/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/stats/stats.component').then(m => m.StatsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/profile.component').then(m => m.ProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found.component').then(m => m.NotFoundComponent)
  }
];
