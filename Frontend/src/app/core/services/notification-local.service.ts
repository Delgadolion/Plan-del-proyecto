import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'session' | 'achievement' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationLocalService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.initializeStorage();
    this.loadNotifications();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem('notifications')) {
      const defaultNotifications: Notification[] = [
        {
          id: 1,
          type: 'session',
          title: 'Sesión próxima a comenzar',
          message: 'Tu sesión de Matemáticas comienza en 15 minutos',
          time: this.getTimeAgo(5),
          read: false,
          createdAt: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: 2,
          type: 'achievement',
          title: '¡Nuevo logro desbloqueado!',
          message: 'Has obtenido el logro "Semana Perfecta"',
          time: this.getTimeAgo(60),
          read: false,
          createdAt: new Date(Date.now() - 60 * 60000).toISOString()
        },
        {
          id: 3,
          type: 'session',
          title: 'Invitación a sesión',
          message: 'María te invitó a una sesión de Programación',
          time: this.getTimeAgo(120),
          read: false,
          createdAt: new Date(Date.now() - 120 * 60000).toISOString()
        },
        {
          id: 4,
          type: 'achievement',
          title: '¡Logro desbloqueado!',
          message: 'Has obtenido el logro "Madrugador"',
          time: this.getTimeAgo(24 * 60),
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString()
        },
        {
          id: 5,
          type: 'session',
          title: 'Sesión completada',
          message: 'Completaste 2 horas de estudio de Historia',
          time: this.getTimeAgo(48 * 60),
          read: true,
          createdAt: new Date(Date.now() - 48 * 60 * 60000).toISOString()
        }
      ];
      localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
    }
  }

  private loadNotifications(): void {
    const notifications = this.getNotificationsFromStorage();
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private getNotificationsFromStorage(): Notification[] {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  private updateUnreadCount(): void {
    const notifications = this.getNotificationsFromStorage();
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private getTimeAgo(minutes: number): string {
    if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  }

  // Obtener todas las notificaciones
  getAllNotifications(): Observable<Notification[]> {
    const notifications = this.getNotificationsFromStorage();
    console.log('🔔 Obteniendo todas las notificaciones:', notifications);
    return of(notifications);
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): Observable<Notification[]> {
    const notifications = this.getNotificationsFromStorage();
    const unread = notifications.filter(n => !n.read);
    console.log('📢 Notificaciones no leídas:', unread);
    return of(unread);
  }

  // Obtener notificación por ID
  getNotificationById(id: number): Observable<Notification | undefined> {
    const notifications = this.getNotificationsFromStorage();
    return of(notifications.find(n => n.id === id));
  }

  // Marcar notificación como leída
  markAsRead(id: number): Observable<Notification> {
    const notifications = this.getNotificationsFromStorage();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
      this.notificationsSubject.next(notifications);
      this.updateUnreadCount();
      console.log('✅ Notificación marcada como leída:', notifications[index]);
      return of(notifications[index]);
    }
    
    return of(notifications[index]);
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead(): Observable<Notification[]> {
    const notifications = this.getNotificationsFromStorage();
    notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    console.log('✅ Todas las notificaciones marcadas como leídas');
    return of(notifications);
  }

  // Crear nueva notificación
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Observable<Notification> {
    const notifications = this.getNotificationsFromStorage();
    const newId = Math.max(...notifications.map(n => n.id), 0) + 1;
    
    const newNotification: Notification = {
      ...notification,
      id: newId,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    console.log('🆕 Nueva notificación creada:', newNotification);
    return of(newNotification);
  }

  // Eliminar notificación
  deleteNotification(id: number): Observable<void> {
    const notifications = this.getNotificationsFromStorage();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(filtered));
    this.notificationsSubject.next(filtered);
    this.updateUnreadCount();
    console.log('🗑️ Notificación eliminada:', id);
    return of(void 0);
  }

  // Limpiar todas las notificaciones
  clearAllNotifications(): Observable<void> {
    localStorage.setItem('notifications', JSON.stringify([]));
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    console.log('🧹 Todas las notificaciones eliminadas');
    return of(void 0);
  }

  // Obtener notificaciones por tipo
  getNotificationsByType(type: string): Observable<Notification[]> {
    const notifications = this.getNotificationsFromStorage();
    const filtered = notifications.filter(n => n.type === type);
    return of(filtered);
  }

  // Obtener notificaciones recientes
  getRecentNotifications(limit: number = 10): Observable<Notification[]> {
    const notifications = this.getNotificationsFromStorage();
    return of(notifications.slice(0, limit));
  }

  // Obtener conteo de notificaciones no leídas
  getUnreadCount(): Observable<number> {
    const notifications = this.getNotificationsFromStorage();
    const unreadCount = notifications.filter(n => !n.read).length;
    return of(unreadCount);
  }
}
