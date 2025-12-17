import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { Session } from '../../core/models/session.model';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <app-header></app-header>
      <main class="flex-1">
        <div class="container px-4 py-8 max-w-7xl mx-auto">
          <!-- Sessions Header -->
          <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 class="text-3xl font-bold text-foreground mb-2">Sesiones Activas</h1>
                <p class="text-muted-foreground">Únete a una sesión de estudio o crea la tuya</p>
              </div>
              <button
                (click)="goToCreate()"
                class="gap-2 px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors inline-flex items-center justify-center w-full sm:w-auto"
              >
                <span>➕</span>
                Crear Sesión
              </button>
            </div>

            <!-- Search and Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              <input
                type="text"
                placeholder="Buscar sesiones por título o categoría..."
                class="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </div>
              <button class="gap-2 px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-muted transition-colors inline-flex items-center justify-center">
                <span>⚙️</span>
                Filtros
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="text-center py-12">
            <p class="text-muted-foreground">Cargando sesiones...</p>
          </div>

          <!-- Error -->
          <div
            *ngIf="error"
            class="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md"
          >
            {{ error }}
          </div>

          <!-- Sessions Grid -->
          <div
            *ngIf="!loading && sessions.length > 0"
            class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div *ngFor="let session of sessions" 
              class="bg-card border border-border rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col">
              <!-- Card Header -->
              <div class="p-6 pb-3">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {{ session.tema || 'Sin categoría' }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <span>🔴</span>
                    En vivo
                  </span>
                </div>
                <h3 class="font-bold text-foreground text-lg leading-tight">{{ session.titulo }}</h3>
              </div>

              <!-- Card Content -->
              <div class="flex-1 px-6 space-y-4">
                <!-- Host Info -->
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {{ (session.creador?.name || 'A')[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-muted-foreground">Anfitrión</p>
                    <p class="text-sm font-medium text-foreground truncate">{{ session.creador?.name || 'Anónimo' }}</p>
                  </div>
                </div>

                <!-- Session Stats -->
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>👥</span>
                    <span>{{ session.participants || 1 }} / {{ session.maxParticipantes || 5 }} participantes</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>⏱️</span>
                    <span>{{ calculateDuration(session) }}</span>
                  </div>
                </div>

                <!-- Time Info -->
                <div class="pt-2">
                  <p class="text-sm font-medium text-foreground">En curso</p>
                </div>
              </div>

                <!-- Card Footer -->
                <div class="p-6 pt-3 border-t border-border">
                  <button
                    *ngIf="!isParticipant(session.id)"
                    (click)="joinSession(session.id)"
                    [disabled]="loadingSessionId === session.id"
                    class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span *ngIf="loadingSessionId !== session.id">✓ Unirse</span>
                    <span *ngIf="loadingSessionId === session.id" class="inline-flex gap-1">
                      <span class="animate-pulse">.</span>
                      <span class="animate-pulse" style="animation-delay: 0.2s">.</span>
                      <span class="animate-pulse" style="animation-delay: 0.4s">.</span>
                    </span>
                  </button>
                  <button
                    *ngIf="isParticipant(session.id)"
                    (click)="leaveSession(session.id)"
                    [disabled]="loadingSessionId === session.id"
                    class="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span *ngIf="loadingSessionId !== session.id">✕ Abandonar</span>
                    <span *ngIf="loadingSessionId === session.id" class="inline-flex gap-1">
                      <span class="animate-pulse">.</span>
                      <span class="animate-pulse" style="animation-delay: 0.2s">.</span>
                      <span class="animate-pulse" style="animation-delay: 0.4s">.</span>
                    </span>
                  </button>
                </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && sessions.length === 0" class="text-center py-12">
            <p class="text-muted-foreground mb-4">No hay sesiones disponibles</p>
            <button
              (click)="goToCreate()"
              class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition-colors"
            >
              Crea la primera sesión
            </button>
          </div>
        </div>
      </main>
      <app-footer></app-footer>

      <!-- Join with code dialog button (floating) -->
      <button
        (click)="showJoinDialog = true"
        class="fixed bottom-6 right-6 gap-2 shadow-lg bg-card border border-border text-foreground px-4 py-2 rounded-md hover:bg-muted transition-colors inline-flex items-center font-medium"
      >
        <span>🔗</span>
        Unirse con código
      </button>

      <!-- Join with code dialog -->
      <div *ngIf="showJoinDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-card border border-border rounded-lg p-6 sm:max-w-[425px] w-full mx-4">
          <!-- Dialog Header -->
          <div class="mb-4">
            <h2 class="text-xl font-bold text-foreground">Unirse con código</h2>
            <p class="text-sm text-muted-foreground">Ingresa el código de la sesión privada para unirte</p>
          </div>

          <!-- Dialog Content -->
          <div class="space-y-4 mb-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Código de sesión</label>
              <input
                type="text"
                placeholder="Ej: ABC123"
                [(ngModel)]="joinCode"
                (input)="joinCode = $event.target.value.toUpperCase()"
                maxlength="6"
                class="w-full font-mono text-lg text-center px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Dialog Footer -->
          <div class="flex gap-2">
            <button
              (click)="showJoinDialog = false"
              [disabled]="loadingWithCode"
              class="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              (click)="joinWithCode()"
              [disabled]="loadingWithCode || !joinCode.trim()"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span *ngIf="!loadingWithCode">✓ Unirse</span>
              <span *ngIf="loadingWithCode" class="inline-flex gap-1">
                <span class="animate-pulse">.</span>
                <span class="animate-pulse" style="animation-delay: 0.2s">.</span>
                <span class="animate-pulse" style="animation-delay: 0.4s">.</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SessionsListComponent implements OnInit, OnDestroy {
  sessions: Session[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  mySessionIds: Set<string> = new Set();
  showJoinDialog: boolean = false;
  joinCode: string = '';
  loadingSessionId: string | null = null; // Para rastrear cuál sesión se está procesando
  loadingMySession = false; // Para cargar mis sesiones
  loadingWithCode = false; // Para buscar por código
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;
  }

  ngOnInit() {
    this.loadSessions();
    this.loadMySession();
    
    // Suscribirse a nuevas sesiones creadas
    this.sessionService.sessionCreated
      .pipe(takeUntil(this.destroy$))
      .subscribe((newSession: Session) => {
        console.log('📨 Nueva sesión detectada, recargando lista:', newSession.titulo);
        // Recargar la lista de sesiones cuando se crea una nueva
        this.loadSessions();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSessions() {
    this.loading = true;
    this.error = null;
    this.sessionService.getAllSessions().subscribe({
      next: (sessions: Session[]) => {
        console.log('✅ Sesiones cargadas:', sessions);
        this.sessions = sessions || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar sesiones:', err);
        this.error = 'Error al cargar sesiones: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadMySession() {
    this.loadingMySession = true;
    this.sessionService.getMySessions().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          response.forEach((s: any) => {
            if (s.id) this.mySessionIds.add(s.id);
          });
        }
        this.loadingMySession = false;
      },
      error: () => {
        this.loadingMySession = false;
      }
    });
  }

  isParticipant(sessionId: string): boolean {
    return this.mySessionIds.has(sessionId);
  }

  joinSession(sessionId: string) {
    console.log('🤝 Uniendo a sesión:', sessionId);
    this.loadingSessionId = sessionId;
    this.error = null;
    
    this.sessionService.joinSession(sessionId).subscribe({
      next: (response) => {
        console.log('✅ Unido a la sesión correctamente');
        this.mySessionIds.add(sessionId);
        this.loadingSessionId = null;
        // Navegar al detalle de la sesión
        this.router.navigate(['/sessions', sessionId]);
      },
      error: (err: any) => {
        this.loadingSessionId = null;
        console.error('❌ Error al unirse:', err);
        
        const errorMessage = err.error?.error || err.message || 'Error desconocido';
        
        // Si el error es "Ya eres participante", navegamos igualmente
        if (err.status === 400 && errorMessage.includes('Ya eres participante')) {
          console.log('✅ Ya eres participante, navegando al detalle');
          this.mySessionIds.add(sessionId);
          this.router.navigate(['/sessions', sessionId]);
        } 
        // Si es un timeout
        else if (err.name === 'TimeoutError' || errorMessage.includes('timeout')) {
          this.error = 'La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.';
        }
        // Otros errores
        else {
          this.error = 'Error al unirse: ' + errorMessage;
        }
        
        // Limpiar error después de 5 segundos
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    });
  }

  leaveSession(sessionId: string) {
    this.loadingSessionId = sessionId;
    this.sessionService.leaveSession(sessionId).subscribe({
      next: () => {
        console.log('✅ Abandonaste la sesión');
        this.mySessionIds.delete(sessionId);
        this.loadingSessionId = null;
        this.loadSessions();
      },
      error: (err: any) => {
        console.error('❌ Error al abandonar sesión:', err);
        this.loadingSessionId = null;
        this.error = 'Error al abandonar: ' + err.message;
        setTimeout(() => {
          this.error = null;
        }, 4000);
      }
    });
  }

  viewSession(sessionId: string) {
    this.router.navigate(['/sessions', sessionId]);
  }

  goToCreate() {
    this.router.navigate(['/sessions/create']);
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

  joinWithCode() {
    this.loadingWithCode = true;
    console.log('🔍 Buscando sesión con código:', this.joinCode);
    
    // Cargar todas las sesiones incluyendo privadas para buscar por código
    this.sessionService.getAllSessionsIncludingPrivate().subscribe({
      next: (sessions: Session[]) => {
        console.log('📋 Todas las sesiones:', sessions);
        // Buscar sesión con ese código de acceso
        const sessionFound = sessions.find(s => 
          s.accessCode?.toUpperCase() === this.joinCode.toUpperCase() && s.isPrivate
        );

        if (sessionFound) {
          console.log('✅ Sesión encontrada:', sessionFound.titulo);
          this.loadingWithCode = false;
          // Unirse a la sesión encontrada
          this.joinSession(sessionFound.id);
          this.showJoinDialog = false;
          this.joinCode = '';
        } else {
          console.log('❌ No se encontró sesión con código:', this.joinCode);
          this.loadingWithCode = false;
          this.error = 'No se encontró ninguna sesión con ese código';
          setTimeout(() => {
            this.error = null;
          }, 3000);
        }
      },
      error: (err: any) => {
        console.error('❌ Error al cargar sesiones:', err);
        this.loadingWithCode = false;
        this.error = 'Error al buscar sesión: ' + err.message;
        setTimeout(() => {
          this.error = null;
        }, 4000);
      }
    });
  }
}
