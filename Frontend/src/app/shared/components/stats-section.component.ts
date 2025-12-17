import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  icon: string;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-stats-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 bg-muted/30">
      <div class="container px-4 max-w-7xl mx-auto">
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold text-foreground mb-2">Tu Progreso</h2>
          <p class="text-muted-foreground">Sigue mejorando cada día</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let stat of stats" class="p-6 text-center border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div [ngClass]="[stat.bgColor, 'inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4']">
              <span [ngClass]="['text-xl', stat.color]">{{ getIcon(stat.icon) }}</span>
            </div>
            <div class="text-2xl font-bold text-foreground mb-1">{{ stat.value }}</div>
            <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class StatsSectionComponent {
  stats: Stat[] = [
    {
      icon: 'clock',
      value: '24h 30m',
      label: 'Tiempo estudiado',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: 'target',
      value: '18',
      label: 'Sesiones completadas',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: 'trophy',
      value: '12',
      label: 'Logros desbloqueados',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: 'flame',
      value: '7 días',
      label: 'Racha actual',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  getIcon(icon: string): string {
    const icons: { [key: string]: string } = {
      'clock': '⏱️',
      'target': '🎯',
      'trophy': '🏆',
      'flame': '🔥',
    };
    return icons[icon] || '📊';
  }
}
