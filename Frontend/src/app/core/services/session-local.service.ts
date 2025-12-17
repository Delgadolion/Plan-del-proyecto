import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  title?: string;
  titulo?: string;
  subject?: string;
  tema?: string;
  description?: string;
  descripcion?: string;
  duration?: number;
  duracion?: number;
  status?: 'active' | 'upcoming' | 'completed';
  estado?: 'en-curso' | 'planificado' | 'finalizado';
  createdBy?: string;
  creador?: any;
  participants?: number;
  creadorId?: string;
  pomodoroTime?: number;
  breakTime?: number;
  numPomodoros?: number;
  createdAt?: string;
  startTime?: string;
  maxParticipantes?: number;
  isPrivate?: boolean;
  accessCode?: string;
  enableChat?: boolean;
  allowLateJoin?: boolean;
  notifications?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionLocalService {

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem('sessions')) {
      localStorage.setItem('sessions', JSON.stringify([]));
    }
  }

  // Obtener todas las sesiones
  getAllSessions(): Observable<Session[]> {
    const sessions = this.getSessionsFromStorage();
    console.log('📋 Obteniendo todas las sesiones:', sessions);
    return of(sessions);
  }

  // Obtener mis sesiones (requiere auth)
  getMySessions(): Observable<Session[]> {
    const userId = this.getUserIdFromAuth();
    const allSessions = this.getSessionsFromStorage();
    const mySessions = allSessions.filter(s => s.creadorId === userId);
    console.log('📋 Mis sesiones:', mySessions);
    return of(mySessions);
  }

  // Obtener sesión por ID
  getSessionById(id: string): Observable<Session | undefined> {
    const sessions = this.getSessionsFromStorage();
    const session = sessions.find(s => s.id === id);
    return of(session);
  }

  // Crear nueva sesión (requiere auth)
  createSession(sessionData: Partial<Session>): Observable<Session> {
    const userId = this.getUserIdFromAuth();
    
    const newSession: Session = {
      ...sessionData as Session,
      id: uuidv4(),
      creadorId: userId,
      createdAt: new Date().toISOString(),
      participants: 1
    };
    
    const sessions = this.getSessionsFromStorage();
    sessions.push(newSession);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    console.log('✅ Sesión creada en localStorage:', newSession);
    console.log('📊 Total de sesiones:', sessions.length);
    
    return of(newSession);
  }

  // Actualizar sesión (requiere auth)
  updateSession(id: string, sessionData: Partial<Session>): Observable<Session> {
    const sessions = this.getSessionsFromStorage();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index > -1) {
      sessions[index] = { ...sessions[index], ...sessionData };
      localStorage.setItem('sessions', JSON.stringify(sessions));
      console.log('✏️ Sesión actualizada:', sessions[index]);
      return of(sessions[index]);
    }
    
    throw new Error('Sesión no encontrada');
  }

  // Eliminar sesión (requiere auth)
  deleteSession(id: string): Observable<any> {
    const sessions = this.getSessionsFromStorage();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem('sessions', JSON.stringify(filtered));
    console.log('🗑️ Sesión eliminada. Total restante:', filtered.length);
    return of({ message: 'Sesión eliminada' });
  }

  // Unirse a una sesión (requiere auth)
  joinSession(id: string): Observable<any> {
    const sessions = this.getSessionsFromStorage();
    const session = sessions.find(s => s.id === id);
    
    if (session && session.participants) {
      session.participants += 1;
      localStorage.setItem('sessions', JSON.stringify(sessions));
      console.log('👥 Te uniste a la sesión. Participantes:', session.participants);
    }
    
    return of({ message: 'Te uniste a la sesión' });
  }

  // Abandonar una sesión (requiere auth)
  leaveSession(id: string): Observable<any> {
    const sessions = this.getSessionsFromStorage();
    const session = sessions.find(s => s.id === id);
    
    if (session && session.participants && session.participants > 1) {
      session.participants -= 1;
      localStorage.setItem('sessions', JSON.stringify(sessions));
      console.log('👋 Abandonaste la sesión. Participantes:', session.participants);
    }
    
    return of({ message: 'Abandonaste la sesión' });
  }

  // Helper methods para localStorage
  private getSessionsFromStorage(): Session[] {
    const sessions = localStorage.getItem('sessions');
    return sessions ? JSON.parse(sessions) : [];
  }

  private getUserIdFromAuth(): string {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (e) {
        return 'unknown-user';
      }
    }
    return 'unknown-user';
  }

  // Limpiar todas las sesiones (para testing)
  clearAllSessions(): void {
    localStorage.setItem('sessions', JSON.stringify([]));
    console.log('🧹 Todas las sesiones han sido eliminadas');
  }

  // Obtener estadísticas
  getStats(): Observable<any> {
    const sessions = this.getSessionsFromStorage();
    const totalParticipants = sessions.reduce((sum, s) => sum + (s.participants || 0), 0);
    
    const stats = {
      totalSessions: sessions.length,
      totalParticipants: totalParticipants,
      avgDuration: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.duracion || 0), 0) / sessions.length)
        : 0
    };
    
    console.log('📊 Estadísticas:', stats);
    return of(stats);
  }
}
