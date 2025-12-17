import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { SessionService } from '../../../core/services/session.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { Session } from '../../../core/models/session.model';
import { SocketService } from 'src/app/core/services/socket.service';


@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.css']
})
export class ActiveSessionComponent implements OnInit, OnDestroy {
  session: Session | null = null;
  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private sessionId: string | null = null;

  // Pomodoro
  pomodoroTime: number = 25;
  breakTime: number = 5;
  currentTime: number = 0;
  isRunning = false;
  isBreak = false;
  pomodoroCount = 0;
  timerInterval: any = null;

  // Chat en tiempo real
  messages: any[] = [];
  chatMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private socketService: SocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.joinAndLoadSession();

    // Escuchar mensajes de chat en tiempo real
    this.socketService.on('chatMessage', (msg) => {
      console.log('💬 Nuevo mensaje:', msg);
      this.ngZone.run(() => {
        this.messages.push(msg);
        this.cdr.markForCheck();
        console.log('📊 Mensajes totales:', this.messages.length);
      });
    });

    // Escuchar actualizaciones del timer en tiempo real
    this.socketService.on('timerUpdate', (timerState) => {
      console.log('⏱️ Timer actualizado:', timerState);
      this.ngZone.run(() => {
        this.currentTime = timerState.currentTime;
        this.isRunning = timerState.isRunning;
        this.isBreak = timerState.isBreak || false;
        this.cdr.markForCheck();
      });
    });

    // Escuchar cuando un usuario se une
    this.socketService.on('userJoined', (user: any) => {
      console.log('👤 Usuario se unió:', user.name);
      this.ngZone.run(() => {
        this.successMessage = `${user.name} se unió a la sesión`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.markForCheck();
        }, 3000);
      });
    });

    // Escuchar cuando un usuario se va
    this.socketService.on('userLeft', (user: any) => {
      console.log('👤 Usuario se fue:', user.name);
      this.ngZone.run(() => {
        this.error = `${user.name} salió de la sesión`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.error = null;
          this.cdr.markForCheck();
        }, 3000);
      });
    });
  }

  /**
   * 🔥 CAMBIO CRÍTICO #1: Ahora se UNE a la sesión antes de cargar
   */
  private joinAndLoadSession(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id');
    
    if (!this.sessionId) {
      this.error = 'ID de sesión no encontrado';
      this.isLoading = false;
      return;
    }

    console.log('🚀 Uniéndose a sesión:', this.sessionId);

    // PASO 1: Unirse a la sesión (registrarse como participante)
    this.sessionService.joinSession(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Unido exitosamente a la sesión');
          
          // Unirse a la sala de Socket.io para tiempo real
          if (this.sessionId && this.currentUser) {
            this.socketService.joinRoom(this.sessionId, this.currentUser);
          }

          // PASO 2: Cargar la sesión actualizada
          this.loadSession();

          // PASO 3: Iniciar polling para actualizar participantes
          this.startParticipantsPolling();
        },
        error: (err) => {
          console.error('❌ Error al unirse:', err);
          
          // Si ya es participante, solo cargar la sesión
          if (err.error?.error === 'Ya eres participante de esta sesión') {
            console.log('ℹ️ Ya eres participante, cargando sesión...');
            this.loadSession();
            this.startParticipantsPolling();
          } else {
            this.error = err.error?.error || 'Error al unirse a la sesión';
            this.isLoading = false;
          }
        }
      });
  }

  /**
   * Carga los datos de la sesión
   */
  private loadSession(): void {
    if (!this.sessionId) return;

    this.sessionService.getSessionById(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          this.session = session;
          this.pomodoroTime = session.pomodoroTime || session.duration || session.duracion || 25;
          this.breakTime = session.breakTime || 5;
          this.currentTime = this.pomodoroTime * 60; // en segundos
          this.isLoading = false;
          
          console.log('📊 Sesión cargada:', {
            titulo: session.title || session.titulo,
            participantes: this.getParticipantCount()
          });
        },
        error: (err) => {
          console.error('❌ Error al cargar sesión:', err);
          this.error = err.error?.error || 'Error al cargar la sesión';
          this.isLoading = false;
        }
      });
  }

  /**
   * 🔥 CAMBIO CRÍTICO #2: Polling para actualizar participantes cada 5 segundos
   */
  private startParticipantsPolling(): void {
    if (!this.sessionId) return;

    console.log('🔄 Iniciando polling de participantes (cada 5s)');

    interval(5000) // Cada 5 segundos
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.sessionService.getSessionById(this.sessionId!))
      )
      .subscribe({
        next: (session) => {
          // Solo actualizar participantes, no reiniciar el timer
          if (this.session) {
            const oldCount = this.getParticipantCount();
            
            // Actualizar la sesión completa
            this.session.participants = session.participants;
            this.session.participantes = session.participantes;
            
            const newCount = this.getParticipantCount();
            
            if (oldCount !== newCount) {
              console.log(`👥 Participantes actualizados: ${oldCount} → ${newCount}`);
            }
          }
        },
        error: (err) => {
          console.error('⚠️ Error en polling:', err);
          // No mostrar error al usuario, solo log
        }
      });
  }

  private getCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  /**
   * Helper para obtener número de participantes
   */
  private getParticipantCount(): number {
    if (!this.session) return 0;
    
    if (Array.isArray(this.session.participants)) {
      return this.session.participants.length;
    }
    
    if (Array.isArray(this.session.participantes)) {
      return this.session.participantes.length;
    }
    
    return 0;
  }

  startPomodoro(): void {
    this.isRunning = true;
    this.sendTimerUpdate(); // Notificar que el timer inició
    this.timerInterval = setInterval(() => {
      if (this.currentTime > 0) {
        this.currentTime--;
        this.sendTimerUpdate(); // Sincronizar cada segundo
      } else {
        clearInterval(this.timerInterval);
        this.toggleBreak();
      }
    }, 1000);
  }

  pausePomodoro(): void {
    this.isRunning = false;
    this.sendTimerUpdate(); // Notificar pausa
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetPomodoro(): void {
    this.isRunning = false;
    this.sendTimerUpdate(); // Notificar reset
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.currentTime = this.pomodoroTime * 60;
    this.isBreak = false;
  }

  toggleBreak(): void {
    this.isBreak = !this.isBreak;
    if (!this.isBreak) {
      this.pomodoroCount++;
    }
    this.currentTime = (this.isBreak ? this.breakTime : this.pomodoroTime) * 60;
    this.startPomodoro(); // Reinicia automáticamente
  }

  leaveSession(): void {
    if (!this.session) return;

    // Notificar salida de la sala en tiempo real
    if (this.sessionId && this.currentUser) {
      this.socketService.leaveRoom(this.sessionId, this.currentUser);
    }

    this.sessionService.leaveSession(this.session.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('👋 Sesión abandonada exitosamente');
          this.pausePomodoro();
          this.router.navigate(['/sessions']);
        },
        error: (err) => {
          console.error('❌ Error al salir:', err);
          this.error = err.error?.error || 'Error al abandonar la sesión';
        }
      });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Obtener el nombre del creador de la sesión
   */
  getCreatorName(): string {
    if (!this.session) return 'Desconocido';
    
    if (this.session.creator?.name) return this.session.creator.name;
    if (this.session.creador?.name) return this.session.creador.name;
    
    return 'Anfitrión';
  }

  /**
   * Verificar si el usuario actual es el creador
   */
  isCreator(): boolean {
    if (!this.session || !this.currentUser) return false;
    
    return this.session.creatorId === this.currentUser.id || 
           this.session.creadorId === this.currentUser.id;
  }

  /**
   * Obtener el estado de la sesión en español
   */
  getStatusText(): string {
    if (!this.session) return 'Desconocido';
    
    const status = this.session.status || this.session.estado;
    
    const statusMap: { [key: string]: string } = {
      'active': 'En vivo',
      'en-curso': 'En vivo',
      'upcoming': 'Próxima',
      'planificado': 'Próxima',
      'completed': 'Completada',
      'finalizado': 'Completada'
    };
    
    if (!status) return 'Desconocido';
    return statusMap[status] || status;
  }

  /**
   * Obtener lista de participantes
   */
  getParticipantsList(): any[] {
    if (!this.session) return [];
    
    if (Array.isArray(this.session.participants)) {
      return this.session.participants;
    }
    
    if (Array.isArray(this.session.participantes)) {
      return this.session.participantes;
    }
    
    return [];
  }

  /**
   * Obtener el nombre de un participante
   */
  getParticipantName(participant: any): string {
    return participant.name || participant.usuario?.name || participant.usuarioId || 'Desconocido';
  }

  /**
   * Obtener la inicial del participante para avatar
   */
  getParticipantInitial(participant: any): string {
    const name = this.getParticipantName(participant);
    return name.charAt(0).toUpperCase();
  }

  /**
   * Verificar si el participante es el usuario actual
   */
  isCurrentUser(participant: any): boolean {
    if (!this.currentUser) return false;
    
    return participant.id === this.currentUser.id || 
           participant.usuarioId === this.currentUser.id;
  }

  /**
   * Finalizar la sesión (solo creador)
   */
  endSession(): void {
    if (!this.isCreator() || !this.session) return;

    if (!confirm('¿Estás seguro de que quieres finalizar esta sesión? Esto afectará a todos los participantes.')) {
      return;
    }

    this.sessionService.updateSession(this.session.id, { 
      estado: 'finalizado',
      status: 'completed'
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Sesión finalizada');
          this.successMessage = 'Sesión finalizada correctamente';
          this.pausePomodoro();
          setTimeout(() => {
            this.router.navigate(['/sessions']);
          }, 2000);
        },
        error: (err) => {
          console.error('❌ Error al finalizar sesión:', err);
          this.error = err.error?.error || 'Error al finalizar la sesión';
        }
      });
  }

  /**
   * Enviar mensaje de chat en tiempo real
   */
  sendMessage(text: string) {
    if (!this.sessionId || !this.currentUser || !text.trim()) return;

    const msg = {
      user: this.currentUser,
      text: text.trim(),
      timestamp: new Date()
    };

    console.log('📤 Enviando mensaje:', msg);
    this.socketService.sendMessage(this.sessionId, msg);
    
    // Limpiar input DENTRO del contexto de Angular
    this.ngZone.run(() => {
      this.chatMessage = '';
      this.cdr.markForCheck();
    });
  }

  /**
   * Enviar actualización del timer a todos los participantes
   */
  sendTimerUpdate() {
    if (!this.sessionId) return;

    this.socketService.sendTimerUpdate(this.sessionId, {
      currentTime: this.currentTime,
      isRunning: this.isRunning,
      isBreak: this.isBreak,
      pomodoroCount: this.pomodoroCount
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 Limpiando componente...');
    
    // Desuscribirse de eventos de Socket.io para evitar memory leaks
    this.socketService.off('chatMessage');
    this.socketService.off('timerUpdate');
    this.socketService.off('userJoined');
    this.socketService.off('userLeft');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
}