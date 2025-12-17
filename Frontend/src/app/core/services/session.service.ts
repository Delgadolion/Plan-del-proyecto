import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, timeout } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:4000/api/sessions';
  
  // Subject para notificar cuando se crea una nueva sesión
  private sessionCreated$ = new Subject<Session>();
  public sessionCreated = this.sessionCreated$.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener todas las sesiones (solo públicas)
  getAllSessions(): Observable<Session[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      timeout(30000),
      map(response => response.sessions || [])
    );
  }

  // Obtener TODAS las sesiones incluyendo privadas (para búsqueda por código)
  getAllSessionsIncludingPrivate(): Observable<Session[]> {
    return this.http.get<any>(this.apiUrl + '?includePrivate=true').pipe(
      timeout(30000),
      map(response => response.sessions || [])
    );
  }

  // Obtener mis sesiones (requiere auth)
  getMySessions(): Observable<Session[]> {
    return this.http.get<any>(`${this.apiUrl}/usuario/mis-sesiones`).pipe(
      timeout(30000),
      map(response => response.sessions || [])
    );
  }

  // Obtener sesión por ID
  getSessionById(id: string): Observable<Session> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      timeout(30000),
      map(response => response.session || response)
    );
  }

  // Crear nueva sesión (requiere auth)
  createSession(sessionData: Partial<Session>): Observable<any> {
    return this.http.post<any>(this.apiUrl, sessionData).pipe(
      timeout(10000),
      tap(response => {
        // Emitir evento cuando se crea exitosamente
        const session = response.session || response;
        this.sessionCreated$.next(session);
      })
    );
  }

  // Actualizar sesión (requiere auth)
  updateSession(id: string, sessionData: Partial<Session>): Observable<Session> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, sessionData).pipe(
      timeout(30000),
      map(response => response.session || response)
    );
  }

  // Eliminar sesión (requiere auth)
  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(30000)
    );
  }

  // Unirse a una sesión (requiere auth)
  joinSession(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/join`, {}).pipe(
      timeout(30000)
    );
  }

  // Abandonar una sesión (requiere auth)
  leaveSession(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${sessionId}/leave`, {}).pipe(
      timeout(10000)
    );
  }
}