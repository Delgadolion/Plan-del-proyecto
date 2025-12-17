import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SessionsListComponent } from './features/sessions/sessions-list.component';
import { CreateSessionComponent } from './features/sessions/create-session.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'sessions',
    component: SessionsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sessions/create',
    component: CreateSessionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sessions/:id',
    loadComponent: () => import('./features/sessions/session-view/session-view.component').then(m => m.SessionViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'achievements',
    loadComponent: () => import('./features/achievements/achievements.component').then(m => m.AchievementsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  }
];
