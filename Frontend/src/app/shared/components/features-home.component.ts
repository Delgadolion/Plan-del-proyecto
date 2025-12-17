import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div class="container px-4 max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Herramientas poderosas para tu éxito
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Accede a todas las funcionalidades que necesitas en una sola plataforma
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div *ngFor="let feature of features" class="group">
            <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div class="text-4xl mb-4">{{ feature.icon }}</div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
              <div class="mt-6 pt-6 border-t border-gray-100">
                <a href="#" class="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center gap-2">
                  Aprende más →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 class="text-2xl md:text-3xl font-bold mb-4">
            Comienza tu viaje de estudio hoy
          </h3>
          <p class="text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de estudiantes comprometidos con su aprendizaje
          </p>
          <a
            routerLink="/register"
            class="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Crear Cuenta Gratuita
          </a>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class FeaturesHomeComponent {
  features: Feature[] = [
    {
      icon: '⏱️',
      title: 'Método Pomodoro',
      description: 'Sesiones de 25 minutos enfocadas con descansos estratégicos para maximizar tu productividad y concentración.'
    },
    {
      icon: '🏆',
      title: 'Sistema de Logros',
      description: 'Desbloquea logros mientras estudias y mantén la motivación con puntos y reconocimientos.'
    },
    {
      icon: '📊',
      title: 'Estadísticas Detalladas',
      description: 'Visualiza tu progreso con métricas en tiempo real: horas de estudio, sesiones completadas y tendencias.'
    },
    {
      icon: '👥',
      title: 'Sesiones Colaborativas',
      description: 'Crea o únete a sesiones de estudio con otros usuarios para aprender juntos y mantenerse motivados.'
    },
    {
      icon: '📅',
      title: 'Planificación Inteligente',
      description: 'Organiza tus sesiones, establece metas y recibe sugerencias personalizadas basadas en tu progreso.'
    },
    {
      icon: '🎯',
      title: 'Seguimiento de Objetivos',
      description: 'Define tus metas académicas y da seguimiento a tu avance con herramientas intuitivas y fáciles de usar.'
    }
  ];
}
