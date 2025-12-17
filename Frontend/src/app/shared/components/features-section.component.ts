import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-16 md:py-24 bg-white">
      <div class="container px-4 max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Herramientas para tu éxito académico
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Todas las funcionalidades que necesitas en una sola plataforma
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Pomodoro Method -->
          <a 
            routerLink="/sessions"
            class="group p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-2xl mb-4 group-hover:bg-red-200 transition-colors">
              ⏱️
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Método Pomodoro</h3>
            <p class="text-gray-600">
              Gestiona tu tiempo de estudio con sesiones de 25 minutos focalizadas para máxima productividad
            </p>
          </a>

          <!-- Achievements System -->
          <a 
            routerLink="/achievements"
            class="group p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-2xl mb-4 group-hover:bg-yellow-200 transition-colors">
              🏆
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sistema de Logros</h3>
            <p class="text-gray-600">
              Desbloquea logros mientras estudias y gana puntos para motivarte en tu aprendizaje
            </p>
          </a>

          <!-- Detailed Statistics -->
          <a 
            routerLink="/profile"
            class="group p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl mb-4 group-hover:bg-green-200 transition-colors">
              📊
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Estadísticas Detalladas</h3>
            <p class="text-gray-600">
              Visualiza tu progreso con métricas detalladas de horas estudiadas y sesiones completadas
            </p>
          </a>

          <!-- Planning -->
          <div class="group p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 opacity-50 cursor-not-allowed">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-200 transition-colors">
              📋
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Planificación</h3>
            <p class="text-gray-600">
              Organiza tus sesiones de estudio y planifica tu aprendizaje de forma colaborativa
            </p>
            <p class="text-xs text-gray-500 mt-4 font-semibold">Próximamente</p>
          </div>
        </div>

        <!-- Bottom CTA - Only show if not in dashboard -->
        <div *ngIf="showCTA" class="mt-16 text-center">
          <p class="text-gray-600 mb-6">
            Comienza a estudiar mejor hoy mismo
          </p>
          <a
            routerLink="/register"
            class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Crear Cuenta Gratuita
          </a>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class FeaturesSectionComponent {
  @Input() showCTA = true;
}
