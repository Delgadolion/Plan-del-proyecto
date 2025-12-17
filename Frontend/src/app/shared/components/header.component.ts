import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header style="position: sticky; top: 0; z-index: 50; width: 100%; border-bottom: 1px solid hsl(var(--border)); background-color: hsl(var(--background));">
      <div style="display: flex; height: 4rem; align-items: center; justify-content: space-between; width: 100%; padding: 0 1rem;">
        <!-- Logo + Nombre -->
        <button
          (click)="goHome()"
          style="cursor: pointer; background: none; border: none; padding: 0; display: flex; align-items: center; gap: 0.5rem;"
        >
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.375rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 1.125rem;">
            E
          </div>
          <span style="font-size: 1.25rem; font-weight: bold; color: hsl(var(--foreground));">Estudiemos</span>
        </button>

        <!-- Navigation Desktop -->
        <nav style="display: flex; align-items: center; gap: 1.5rem;" *ngIf="currentUser$ | async">
          <a routerLink="/sessions" style="font-size: 0.875rem; font-weight: 500; color: hsl(var(--muted-foreground)); text-decoration: none; cursor: pointer; transition: color 0.3s;" (mouseenter)="onNavHover($event)" (mouseleave)="onNavLeave($event)">
            Sesiones
          </a>
          <a routerLink="/achievements" style="font-size: 0.875rem; font-weight: 500; color: hsl(var(--muted-foreground)); text-decoration: none; cursor: pointer; transition: color 0.3s;" (mouseenter)="onNavHover($event)" (mouseleave)="onNavLeave($event)">
            Logros
          </a>
          <a routerLink="/profile" style="font-size: 0.875rem; font-weight: 500; color: hsl(var(--muted-foreground)); text-decoration: none; cursor: pointer; transition: color 0.3s;" (mouseenter)="onNavHover($event)" (mouseleave)="onNavLeave($event)">
            Perfil
          </a>
        </nav>

        <!-- Auth Section -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <!-- User logged in -->
          <ng-container *ngIf="currentUser$ | async as user">
            <button
              (click)="confirmLogout()"
              style="padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; background-color: transparent; color: hsl(var(--foreground)); border: 1px solid hsl(var(--border)); border-radius: 0.375rem; cursor: pointer; transition: background-color 0.3s;"
              (mouseenter)="onButtonHover($event)"
              (mouseleave)="onButtonLeave($event)"
            >
              Cerrar Sesión
            </button>
          </ng-container>
          <!-- User not logged in -->
          <ng-container *ngIf="!(currentUser$ | async)">
            <a
              routerLink="/login"
              style="padding: 0.5rem 0.75rem; font-size: 0.875rem; color: hsl(var(--foreground)); text-decoration: none; cursor: pointer; font-weight: 500;"
            >
              Iniciar Sesión
            </a>
            <a
              routerLink="/register"
              style="padding: 0.5rem 0.75rem; font-size: 0.875rem; font-weight: 500; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; border-radius: 0.375rem; text-decoration: none; cursor: pointer;"
            >
              Registrarse
            </a>
          </ng-container>
        </div>
      </div>

      <!-- Logout Confirmation Dialog -->
      <div *ngIf="showLogoutConfirm" style="position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50;">
        <div style="background-color: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); max-width: 28rem;">
          <h2 style="font-size: 1.125rem; font-weight: bold; color: hsl(var(--foreground)); margin-bottom: 1rem;">Confirmar Cerrar Sesión</h2>
          <p style="color: hsl(var(--muted-foreground)); margin-bottom: 1.5rem;">¿Estás seguro de que deseas cerrar sesión?</p>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button
              (click)="cancelLogout()"
              style="padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); background-color: transparent; cursor: pointer; font-weight: 500;"
            >
              Cancelar
            </button>
            <button
              (click)="logout()"
              style="padding: 0.5rem 1rem; border-radius: 0.5rem; background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); border: none; cursor: pointer; font-weight: 500;"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  currentUser$ = this.authService.currentUser$;
  showLogoutConfirm = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  onNavHover(event: Event) {
    const target = event.currentTarget as HTMLElement;
    target.style.color = 'hsl(var(--foreground))';
  }

  onNavLeave(event: Event) {
    const target = event.currentTarget as HTMLElement;
    target.style.color = 'hsl(var(--muted-foreground))';
  }

  onButtonHover(event: Event) {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = 'hsl(var(--muted))';
  }

  onButtonLeave(event: Event) {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = 'transparent';
  }

  confirmLogout() {
    this.showLogoutConfirm = true;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  logout() {
    this.authService.logout();
    this.showLogoutConfirm = false;
    this.router.navigate(['/']);
  }
}
