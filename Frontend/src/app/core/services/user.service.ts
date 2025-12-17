import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserStats {
  sesionesCreadas: number;
  sesionesUnidas: number;
  achievementsDesbloqueados: number;
  tiempoTotalEstudio: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nombre?: string;
  email: string;
  verified: boolean;
  bio?: string;
  fotoPerfil?: string;
  achievements?: any[];
}

export interface UserResponse {
  message?: string;
  usuario?: UserProfile;
  usuarios?: UserProfile[];
  estadisticas?: {
    estadisticas: UserStats;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:4000/api/usuarios';

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.apiUrl);
  }

  // Obtener un usuario por ID
  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  // Obtener mi perfil
  getMyProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/perfil/mi-perfil`);
  }

  // Actualizar mi perfil
  updateProfile(profile: { nombre?: string; name?: string; email?: string; bio?: string; fotoPerfil?: string }): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/perfil/actualizar`, profile);
  }

  // Obtener mis estadísticas
  getMyStats(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/estadisticas/mis-estadisticas`);
  }

  // Eliminar mi cuenta
  deleteAccount(userId: string): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.apiUrl}/${userId}`);
  }
}
