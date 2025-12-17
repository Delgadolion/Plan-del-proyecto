// src/app/core/models/session.model.ts

export interface User {
  id: string;
  name: string;
  email: string;
  verified?: boolean;
}

export interface Participant {
  id: string;
  usuarioId: string;
  sessionId: string;
  estado: 'activo' | 'inactivo' | 'finalizado';
  tiempoEstudio?: number;
  usuario?: User; // Relación con User
  name?: string; // Alias para compatibilidad
}

export interface Session {
  id: string;
  
  // Campos en español (backend)
  titulo?: string;
  descripcion?: string;
  tema?: string;
  duracion?: number;
  estado?: 'en-curso' | 'planificado' | 'finalizado';
  
  // Campos en inglés (frontend)
  title?: string;
  description?: string;
  subject?: string;
  duration?: number;
  status?: 'active' | 'upcoming' | 'completed';
  
  // Configuración de Pomodoro
  pomodoroTime?: number;
  breakTime?: number;
  numPomodoros?: number;
  
  // Configuración de sesión
  maxParticipantes?: number;
  isPrivate?: boolean;
  accessCode?: string;
  enableChat?: boolean;
  allowLateJoin?: boolean;
  notifications?: boolean;
  
  // Participantes (puede ser array o número según el endpoint)
  participants?: Participant[] | User[]; 
  participantes?: Participant[];
  
  // Creador
  creatorId?: string;
  creadorId?: string;
  creador?: User;
  creator?: User;
  
  // Fechas
  createdAt?: string;
  fechaInicio?: string;
  fechaFin?: string;
  startTime?: string;
  
  // Estado
  activo?: boolean;
}