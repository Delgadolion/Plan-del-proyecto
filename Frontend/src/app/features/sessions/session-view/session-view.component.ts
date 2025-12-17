import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header.component';
import { FooterComponent } from '../../../shared/components/footer.component';
import { SessionService } from '../../../core/services/session.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { Session } from '../../../core/models/session.model';
interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-session-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './session-view.component.html',
  styles: []
})
export class SessionViewComponent implements OnInit, OnDestroy {
  sessionId: string = '';
  session: Session | null = null;
  showChat: boolean = true;
  showParticipants: boolean = false;
  isMobile: boolean = false;
  sessionEnded: boolean = false;
  showConfirmDialog: boolean = false;

  // Timer properties
  isRunning: boolean = false;
  currentPomodoro: number = 1;
  isInPomodoro: boolean = true; // Rastrear si estamos en pomodoro o descanso
  timeLeft: number = 25 * 60; // in seconds
  totalSessionTime: number = 0;
  progressPercentage: number = 0;
  private timerInterval: any = null;

  // Chat properties
  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUser: string = 'Tú';
  socketConnected: boolean = false;

  // File upload
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  authUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private socketService: SocketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    this.getCurrentUser();
    
    this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      this.loadSession();
      this.setupSocketListeners();
    });

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });

    this.loadMessages();
  }

  /**
   * 🔌 Configurar listeners de Socket.io para mensajes en tiempo real
   */
  private setupSocketListeners() {
    // Escuchar mensajes de chat
    this.socketService.on('chatMessage', (msg: ChatMessage) => {
      console.log('💬 Mensaje recibido del socket:', msg);
      this.ngZone.run(() => {
        this.messages.push(msg);
        this.saveMessages();
        this.cdr.markForCheck();
      });
    });

    // Escuchar actualizaciones del timer
    this.socketService.on('timerUpdate', (timerState: any) => {
      console.log('⏱️ Timer actualizado:', timerState);
      this.ngZone.run(() => {
        this.timeLeft = timerState.currentTime;
        this.isRunning = timerState.isRunning;
        this.isInPomodoro = timerState.isBreak === false;
        this.currentPomodoro = timerState.pomodoroCount || this.currentPomodoro;
        this.updateProgress();
        this.cdr.markForCheck();
      });
    });

    // Escuchar cuando un usuario se une
    this.socketService.on('userJoined', (user: any) => {
      console.log('👤 Usuario se unió:', user?.name);
      this.ngZone.run(() => {
        const notifMsg: ChatMessage = {
          id: Math.random().toString(36),
          user: 'Sistema',
          text: `✅ ${user?.name} se unió a la sesión`,
          timestamp: new Date()
        };
        this.messages.push(notifMsg);
        this.saveMessages();
        this.cdr.markForCheck();
      });
    });

    // Escuchar cuando un usuario se va
    this.socketService.on('userLeft', (user: any) => {
      console.log('👤 Usuario salió:', user?.name);
      this.ngZone.run(() => {
        const notifMsg: ChatMessage = {
          id: Math.random().toString(36),
          user: 'Sistema',
          text: `❌ ${user?.name} salió de la sesión`,
          timestamp: new Date()
        };
        this.messages.push(notifMsg);
        this.saveMessages();
        this.cdr.markForCheck();
      });
    });
  }

  private getCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.authUser = user;
        this.currentUser = user.name || user.email || 'Tú';
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Desuscribirse de eventos Socket.io
    this.socketService.off('chatMessage');
    this.socketService.off('timerUpdate');
    this.socketService.off('userJoined');
    this.socketService.off('userLeft');
  }

  loadSession() {
    console.log('📥 Cargando sesión con ID:', this.sessionId);
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (session) => {
        if (session) {
          console.log('✅ Sesión cargada:', session);
          this.session = session;
          const pomodoros = session.numPomodoros || 4;
          const pomodoroTime = session.pomodoroTime || 25;
          const breakTime = session.breakTime || 5;
          this.totalSessionTime = (pomodoros * pomodoroTime + (pomodoros - 1) * breakTime) * 60;
          this.timeLeft = pomodoroTime * 60; // Tiempo inicial del primer pomodoro
          this.updateProgress();
          
          // 🔌 UNIRSE A LA SALA DE SOCKET.IO
          if (this.authUser) {
            console.log('🚪 Uniéndose a sala Socket.io:', this.sessionId);
            this.socketService.joinRoom(this.sessionId, this.authUser);
            this.socketConnected = true;
          }
        } else {
          console.error('❌ Sesión no encontrada');
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar sesión:', err);
      }
    });
  }

  calculateDuration(session: Session): string {
    const pomodoros = session.numPomodoros || 4;
    const pomodoroTime = session.pomodoroTime || 25;
    const breakTime = session.breakTime || 5;
    const totalMinutes = (pomodoros * pomodoroTime) + ((pomodoros - 1) * breakTime);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  formatTimeFromSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.formatTime(mins)}:${this.formatTime(secs)}`;
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateProgress();
        
        // 🔌 SINCRONIZAR TIMER EN TIEMPO REAL
        this.sendTimerUpdate();
        
        this.cdr.markForCheck(); // Detectar cambios inmediatamente
      } else {
        this.skipPhase();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  skipPhase() {
    this.pauseTimer();
    const pomodoroTime = (this.session?.pomodoroTime || 25) * 60;
    const breakTime = (this.session?.breakTime || 5) * 60;

    if (this.isInPomodoro) {
      // Estamos en un pomodoro, cambiar a descanso
      this.isInPomodoro = false;
      this.timeLeft = breakTime;
    } else {
      // Estamos en un descanso, cambiar al siguiente pomodoro
      this.currentPomodoro++;
      if (this.currentPomodoro <= (this.session?.numPomodoros || 4)) {
        this.isInPomodoro = true;
        this.timeLeft = pomodoroTime;
      } else {
        // Sesión completada
        this.timeLeft = 0;
        this.currentPomodoro = this.session?.numPomodoros || 4;
      }
    }
    this.updateProgress();
  }

  private updateProgress() {
    // Calcular progreso relativo al pomodoro/descanso actual
    const pomodoroTime = (this.session?.pomodoroTime || 25) * 60;
    const breakTime = (this.session?.breakTime || 5) * 60;
    
    const maxTimeForCurrentPhase = this.isInPomodoro ? pomodoroTime : breakTime;
    const elapsedInPhase = maxTimeForCurrentPhase - this.timeLeft;
    this.progressPercentage = (elapsedInPhase / maxTimeForCurrentPhase) * 100;
  }

  // Chat functions
  loadMessages() {
    const stored = localStorage.getItem(`session-messages-${this.sessionId}`);
    if (stored) {
      try {
        this.messages = JSON.parse(stored);
        console.log('📨 Mensajes cargados del localStorage:', this.messages.length);
      } catch (e) {
        console.error('Error al parsear mensajes:', e);
      }
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      user: this.currentUser,
      text: this.newMessage,
      timestamp: new Date()
    };

    console.log('📤 Enviando mensaje:', message);
    
    // 🔌 ENVIAR POR SOCKET.IO A TODOS EN LA SALA
    this.socketService.sendMessage(this.sessionId, message);
    
    // Agregar localmente también
    this.ngZone.run(() => {
      this.messages.push(message);
      this.newMessage = '';
      this.saveMessages();
      this.cdr.markForCheck();
    });
  }

  private saveMessages() {
    localStorage.setItem(`session-messages-${this.sessionId}`, JSON.stringify(this.messages));
  }

  // File upload
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
      this.uploadedFileName = file.name;
      
      const message: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'Tú',
        text: `📎 Archivo compartido: ${file.name}`,
        timestamp: new Date()
      };
      
      this.messages.push(message);
      this.saveMessages();
      this.uploadedFile = null;
    }
  }

  // Sesión Management
  showLeaveConfirm() {
    this.showConfirmDialog = true;
  }

  cancelLeave() {
    this.showConfirmDialog = false;
  }

  leaveSession() {
    this.showConfirmDialog = false;
    this.pauseTimer();
    
    // 🔌 NOTIFICAR QUE SE VA
    if (this.authUser) {
      this.socketService.leaveRoom(this.sessionId, this.authUser);
    }
    
    // Eliminar la sesión del localStorage
    this.sessionService.deleteSession(this.sessionId).subscribe(() => {
      this.router.navigate(['/sessions']);
    });
  }

  endSession() {
    if (this.session?.creadorId === 'current-user-id' || this.session?.creador?.id === 'current-user-id') {
      this.sessionEnded = true;
      this.pauseTimer();
      // Marcar la sesión como finalizada
      if (this.session) {
        this.session.estado = 'finalizado';
        this.sessionService.updateSession(this.sessionId, this.session).subscribe();
      }
    }
  }

  /**
   * 🔌 ENVIAR ACTUALIZACIÓN DE TIMER POR SOCKET.IO
   */
  private sendTimerUpdate() {
    if (!this.socketConnected) return;
    
    this.socketService.sendTimerUpdate(this.sessionId, {
      currentTime: this.timeLeft,
      isRunning: this.isRunning,
      isBreak: !this.isInPomodoro,
      pomodoroCount: this.currentPomodoro
    });
  }
}