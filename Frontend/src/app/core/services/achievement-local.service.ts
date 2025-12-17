import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'tiempo' | 'racha' | 'social';
  unlocked: boolean;
  unlockedDate?: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementLocalService {
  private achievements: Achievement[] = [
    {
      id: 1,
      name: 'Primera Sesión',
      description: 'Completasta tu primera sesión de estudio',
      icon: '🎯',
      category: 'general',
      unlocked: false,
      points: 50,
    },
    {
      id: 2,
      name: 'Madrugador',
      description: 'Estudiaste antes de las 7 AM',
      icon: '🌅',
      category: 'tiempo',
      unlocked: false,
      points: 75,
    },
    {
      id: 3,
      name: 'Maratón de Estudio',
      description: 'Estudiaste 5 horas en un día',
      icon: '🏃',
      category: 'tiempo',
      unlocked: false,
      points: 100,
    },
    {
      id: 4,
      name: 'Semana Perfecta',
      description: 'Estudiaste todos los días de la semana',
      icon: '⭐',
      category: 'racha',
      unlocked: false,
      points: 150,
    },
    {
      id: 5,
      name: 'Colaborador',
      description: 'Participaste en 10 sesiones colaborativas',
      icon: '🤝',
      category: 'social',
      unlocked: false,
      points: 100,
    },
    {
      id: 6,
      name: 'Enfocado',
      description: 'Completaste 25 Pomodoros sin interrupciones',
      icon: '🎯',
      category: 'general',
      unlocked: false,
      points: 125,
    },
    {
      id: 7,
      name: 'Constante',
      description: 'Mantén una racha de 30 días',
      icon: '📅',
      category: 'racha',
      unlocked: false,
      points: 200,
    },
    {
      id: 8,
      name: 'Nocturno',
      description: 'Estudia después de las 10 PM',
      icon: '🌙',
      category: 'tiempo',
      unlocked: false,
      points: 75,
    },
    {
      id: 9,
      name: 'Centenario',
      description: 'Completa 100 sesiones de estudio',
      icon: '💯',
      category: 'general',
      unlocked: false,
      points: 250,
    },
    {
      id: 10,
      name: 'Velocista',
      description: 'Completa 10 Pomodoros en un día',
      icon: '⚡',
      category: 'tiempo',
      unlocked: false,
      points: 100,
    },
    {
      id: 11,
      name: 'Líder de Grupo',
      description: 'Crea 20 sesiones públicas',
      icon: '👑',
      category: 'social',
      unlocked: false,
      points: 175,
    },
    {
      id: 12,
      name: 'Racha de Fuego',
      description: 'Mantén una racha de 100 días',
      icon: '🔥',
      category: 'racha',
      unlocked: false,
      points: 500,
    },
    {
      id: 13,
      name: 'Maestro del Tiempo',
      description: 'Acumula 500 horas de estudio',
      icon: '⏰',
      category: 'tiempo',
      unlocked: false,
      points: 300,
    },
    {
      id: 14,
      name: 'Comunidad',
      description: 'Participa en 50 sesiones colaborativas',
      icon: '🌟',
      category: 'social',
      unlocked: false,
      points: 200,
    },
  ];

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem('achievements')) {
      localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }
  }

  private getAchievementsFromStorage(): Achievement[] {
    const achievements = localStorage.getItem('achievements');
    return achievements ? JSON.parse(achievements) : this.achievements;
  }

  // Obtener todos los logros
  getAllAchievements(): Observable<Achievement[]> {
    const achievements = this.getAchievementsFromStorage();
    console.log('🏆 Obteniendo todos los logros:', achievements);
    return of(achievements);
  }

  // Obtener logro por ID
  getAchievementById(id: number): Observable<Achievement | undefined> {
    const achievements = this.getAchievementsFromStorage();
    const achievement = achievements.find(a => a.id === id);
    return of(achievement);
  }

  // Obtener logros desbloqueados
  getUnlockedAchievements(): Observable<Achievement[]> {
    const achievements = this.getAchievementsFromStorage();
    const unlocked = achievements.filter(a => a.unlocked);
    console.log('✅ Logros desbloqueados:', unlocked);
    return of(unlocked);
  }

  // Obtener logros bloqueados
  getLockedAchievements(): Observable<Achievement[]> {
    const achievements = this.getAchievementsFromStorage();
    const locked = achievements.filter(a => !a.unlocked);
    console.log('🔒 Logros bloqueados:', locked);
    return of(locked);
  }

  // Obtener logros por categoría
  getAchievementsByCategory(category: string): Observable<Achievement[]> {
    const achievements = this.getAchievementsFromStorage();
    const filtered = achievements.filter(a => a.category === category);
    console.log(`📂 Logros de categoría ${category}:`, filtered);
    return of(filtered);
  }

  // Desbloquear logro
  unlockAchievement(id: number): Observable<Achievement> {
    const achievements = this.getAchievementsFromStorage();
    const index = achievements.findIndex(a => a.id === id);
    
    if (index !== -1 && !achievements[index].unlocked) {
      achievements[index].unlocked = true;
      achievements[index].unlockedDate = new Date().toISOString();
      localStorage.setItem('achievements', JSON.stringify(achievements));
      console.log('🎉 Logro desbloqueado:', achievements[index]);
      return of(achievements[index]);
    }
    
    return of(achievements[index]);
  }

  // Obtener estadísticas de logros
  getAchievementStats(): Observable<{ total: number; unlocked: number; locked: number; totalPoints: number; unlockedPoints: number }> {
    const achievements = this.getAchievementsFromStorage();
    const unlocked = achievements.filter(a => a.unlocked);
    
    const stats = {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: achievements.length - unlocked.length,
      totalPoints: achievements.reduce((sum, a) => sum + a.points, 0),
      unlockedPoints: unlocked.reduce((sum, a) => sum + a.points, 0)
    };
    
    console.log('📊 Estadísticas de logros:', stats);
    return of(stats);
  }

  // Obtener categorías disponibles
  getCategories(): Observable<string[]> {
    const achievements = this.getAchievementsFromStorage();
    const categories = [...new Set(achievements.map(a => a.category))];
    return of(categories);
  }
}
