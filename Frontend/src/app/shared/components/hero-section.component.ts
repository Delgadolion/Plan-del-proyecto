import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 md:py-40">
      <div class="container px-4 max-w-7xl mx-auto">
        <div class="mx-auto max-w-4xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-pulse rounded-full bg-blue-600 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
            </span>
            Método Pomodoro para máxima productividad
          </div>

          <h1 class="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Estudia mejor,
            <span class="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              alcanza más
            </span>
          </h1>

          <p class="mb-10 text-lg text-gray-700 md:text-xl max-w-2xl mx-auto">
            Todo lo que necesitas para estudiar mejor
          </p>

          <!-- Botones para no autenticados -->
          <div *ngIf="!(currentUser$ | async)" class="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
            <a
              routerLink="/login"
              class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Iniciar Sesión
            </a>
            <a
              routerLink="/register"
              class="w-full sm:w-auto px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Registrarse
            </a>
          </div>

          <!-- Botones para autenticados -->
          <div *ngIf="currentUser$ | async" class="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
            <button
              routerLink="/sessions"
              class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Crear Sesión
            </button>
            <button
              routerLink="/sessions"
              class="w-full sm:w-auto px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Unirse a Sesión
            </button>
          </div>
        </div>
      </div>

      <div class="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 translate-x-1/2 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>
    </section>
  `,
  styles: []
})
export class HeroSectionComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}
}
