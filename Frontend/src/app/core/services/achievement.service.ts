import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'social' | 'consistency' | 'achievement';
  points: number;
  unlocked?: boolean;
  unlockedDate?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  locked: number;
  totalPoints: number;
  unlockedPoints: number;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/achievements';

  /**
   * Obtener todos los logros disponibles
   */
  getAllAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(this.apiUrl).pipe(
      tap(achievements => console.log('✅ Logros obtenidos del backend:', achievements)),
      catchError(error => {
        console.error('❌ Error al obtener logros:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener un logro por ID
   */
  getAchievementById(id: string): Observable<Achievement> {
    return this.http.get<Achievement>(`${this.apiUrl}/${id}`).pipe(
      tap(achievement => console.log('✅ Logro obtenido:', achievement)),
      catchError(error => {
        console.error('❌ Error al obtener logro:', error);
        return of({} as Achievement);
      })
    );
  }

  /**
   * Obtener mis logros desbloqueados (requiere autenticación)
   */
  getMyAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/usuario/mis-achievements`).pipe(
      tap(achievements => console.log('✅ Mis logros desbloqueados:', achievements)),
      catchError(error => {
        console.error('❌ Error al obtener mis logros:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener logros por categoría
   */
  getAchievementsByCategory(category: string): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}?category=${category}`).pipe(
      tap(achievements => console.log(`✅ Logros de categoría ${category}:`, achievements)),
      catchError(error => {
        console.error(`❌ Error al obtener logros de ${category}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtener estadísticas de logros del usuario
   */
  getAchievementStats(): Observable<AchievementStats> {
    return this.http.get<AchievementStats>(`${this.apiUrl}/usuario/stats`).pipe(
      tap(stats => console.log('📊 Estadísticas de logros:', stats)),
      catchError(error => {
        console.error('❌ Error al obtener estadísticas:', error);
        return of({
          total: 0,
          unlocked: 0,
          locked: 0,
          totalPoints: 0,
          unlockedPoints: 0
        });
      })
    );
  }

  /**
   * Obtener categorías disponibles
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => console.log('📂 Categorías:', categories)),
      catchError(error => {
        console.error('❌ Error al obtener categorías:', error);
        return of([]);
      })
    );
  }
}
