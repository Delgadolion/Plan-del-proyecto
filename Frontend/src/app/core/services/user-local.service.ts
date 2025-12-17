import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  fotoPerfil?: string;
  username?: string;
  estudiantesAyudados?: number;
  horasEstudio?: number;
  logrosDesbloqueados?: number;
  createdAt?: string;
}

export interface UserStats {
  sesionesCreadas: number;
  sesionesUnidas: number;
  achievementsDesbloqueados: number;
  tiempoTotalEstudio: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserLocalService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeStorage();
    this.loadCurrentUser();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem('users')) {
      const defaultUsers: UserProfile[] = [
        {
          id: '1',
          name: 'Juan Estudiante',
          email: 'juan@estudiamos.com',
          username: 'juan_estudia',
          bio: 'Estudiante apasionado por el aprendizaje continuo. Me encanta usar el método Pomodoro para mantener el enfoque y alcanzar mis metas académicas.',
          fotoPerfil: '/diverse-students-studying.png',
          estudiantesAyudados: 15,
          horasEstudio: 250,
          logrosDesbloqueados: 0,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }

  private loadCurrentUser(): void {
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      const users = this.getUsersFromStorage();
      const user = users.find(u => u.id === currentUserId);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  private getUsersFromStorage(): UserProfile[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<UserProfile[]> {
    const users = this.getUsersFromStorage();
    console.log('👥 Obteniendo todos los usuarios:', users);
    return of(users);
  }

  // Obtener usuario por ID
  getUserById(id: string): Observable<UserProfile | undefined> {
    const users = this.getUsersFromStorage();
    const user = users.find(u => u.id === id);
    console.log('👤 Obteniendo usuario por ID:', user);
    return of(user);
  }

  // Obtener mi perfil
  getMyProfile(): Observable<UserProfile | null> {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      return of(null);
    }
    const user = this.getUsersFromStorage().find(u => u.id === currentUserId);
    return of(user || null);
  }

  // Actualizar perfil
  updateProfile(userId: string, updates: Partial<UserProfile>): Observable<UserProfile> {
    const users = this.getUsersFromStorage();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✏️ Perfil actualizado:', users[index]);
      this.currentUserSubject.next(users[index]);
      return of(users[index]);
    }
    
    throw new Error('Usuario no encontrado');
  }

  // Obtener estadísticas del usuario
  getUserStats(userId: string): Observable<UserStats> {
    const users = this.getUsersFromStorage();
    const user = users.find(u => u.id === userId);
    
    const stats: UserStats = {
      sesionesCreadas: 0,
      sesionesUnidas: 0,
      achievementsDesbloqueados: user?.logrosDesbloqueados || 0,
      tiempoTotalEstudio: user?.horasEstudio || 0
    };
    
    console.log('📊 Estadísticas del usuario:', stats);
    return of(stats);
  }

  // Subir foto de perfil (simulado con localStorage)
  uploadProfilePicture(userId: string, imageUrl: string): Observable<UserProfile> {
    return this.updateProfile(userId, { fotoPerfil: imageUrl });
  }

  // Obtener usuario actual
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  // Actualizar usuario actual
  setCurrentUser(user: UserProfile): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('userId', user.id);
  }

  // Aumentar logros desbloqueados
  incrementUnlockedAchievements(userId: string): Observable<UserProfile> {
    const users = this.getUsersFromStorage();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index].logrosDesbloqueados = (users[index].logrosDesbloqueados || 0) + 1;
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ Logros incrementados:', users[index].logrosDesbloqueados);
      this.currentUserSubject.next(users[index]);
      return of(users[index]);
    }
    
    throw new Error('Usuario no encontrado');
  }

  // Aumentar horas de estudio
  addStudyHours(userId: string, hours: number): Observable<UserProfile> {
    const users = this.getUsersFromStorage();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index].horasEstudio = (users[index].horasEstudio || 0) + hours;
      localStorage.setItem('users', JSON.stringify(users));
      console.log('⏱️ Horas de estudio agregadas:', users[index].horasEstudio);
      this.currentUserSubject.next(users[index]);
      return of(users[index]);
    }
    
    throw new Error('Usuario no encontrado');
  }
}
