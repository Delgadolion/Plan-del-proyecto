import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 md:py-24 bg-white border-t border-b border-gray-200">
      <div class="container px-4 max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Únete a miles de estudiantes
          </h2>
          <p class="text-lg text-gray-600">
            Plataforma confiable para mejorar tu productividad académica
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">10k+</div>
            <p class="text-gray-600 font-medium">Estudiantes activos</p>
            <p class="text-sm text-gray-500 mt-1">Usando Estudiemos diariamente</p>
          </div>

          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">50k+</div>
            <p class="text-gray-600 font-medium">Sesiones completadas</p>
            <p class="text-sm text-gray-500 mt-1">Horas de estudio productivo</p>
          </div>

          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">95%</div>
            <p class="text-gray-600 font-medium">Satisfacción</p>
            <p class="text-sm text-gray-500 mt-1">De nuestros usuarios</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class StatsHomeComponent {}
