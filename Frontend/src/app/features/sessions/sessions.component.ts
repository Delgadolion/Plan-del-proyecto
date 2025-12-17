import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { SessionService } from '../../core/services/session.service';
import { Session } from '../../core/models/session.model';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <app-header></app-header>

      <main class="flex-1 container px-4 py-8 max-w-7xl mx-auto w-full">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-foreground mb-2">Sesiones de Estudio</h1>
            <p class="text-muted-foreground">Únete o crea una sesión para estudiar con otros</p>
          </div>
          <button
            (click)="showCreateForm = !showCreateForm"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            + Nueva Sesión
          </button>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-md text-red-700">
          <p class="font-medium">Error al cargar sesiones</p>
          <p class="text-sm">{{ error }}</p>
          <button 
            (click)="retryLoadSessions()" 
            class="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Reintentar
          </button>
        </div>

        <!-- Create Session Form -->
        <div *ngIf="showCreateForm" class="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 class="text-xl font-bold text-foreground mb-4">Crear Sesión</h2>
          <form [formGroup]="sessionForm" (ngSubmit)="createSession()" class="space-y-4 max-w-md">
            <div>
              <label class="text-sm font-medium text-foreground">Título</label>
              <input
                type="text"
                formControlName="title"
                placeholder="Ej: Matemáticas - Cálculo"
                class="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground">Materia</label>
              <input
                type="text"
                formControlName="subject"
                placeholder="Ej: Matemáticas"
                class="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground">Duración (minutos)</label>
              <input
                type="number"
                formControlName="duration"
                placeholder="90"
                class="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              [disabled]="sessionForm.invalid || creatingSession"
              class="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
            >
              {{ creatingSession ? 'Creando...' : 'Crear Sesión' }}
            </button>
          </form>
        </div>

        <!-- Sessions Grid -->
        <div *ngIf="(sessions$ | async) as sessions; else emptyState">
          <div *ngIf="sessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let session of sessions" class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-foreground">{{ session.title || session.titulo }}</h3>
                  <p class="text-sm text-muted-foreground">{{ session.subject || session.tema }}</p>
                </div>
                <span
                  [ngClass]="{
                    'bg-green-500/10 text-green-500': isActiveStatus(session),
                    'bg-blue-500/10 text-blue-500': isUpcomingStatus(session),
                    'bg-gray-500/10 text-gray-500': isCompletedStatus(session)
                  }"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ getStatusText(session) }}
                </span>
              </div>
              <div class="space-y-2 mb-4 text-sm text-muted-foreground">
                <p>⏱️ {{ session.duration || session.duracion }} minutos</p>
                <p>👥 {{ getParticipantCount(session) }} / {{ session.maxParticipantes || 10 }} participantes</p>
              </div>
              <button 
                (click)="joinSession(session)"
                class="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                {{ isActiveStatus(session) ? '🚀 Unirse' : 'Ver Detalles' }}
              </button>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="text-center py-12">
              <p class="text-lg text-muted-foreground mb-4">Aún no hay sesiones disponibles</p>
              <button
                (click)="showCreateForm = true"
                class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Crea la primera
              </button>
            </div>
          </ng-template>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class SessionsComponent implements OnInit {
  showCreateForm = false;
  sessionForm: FormGroup;
  sessions$: Observable<Session[]>;
  error: string | null = null;
  creatingSession = false;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.sessionForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      duration: [90, [Validators.required, Validators.min(15)]],
    });
    
    this.sessions$ = this.loadSessions();
  }

  ngOnInit() {
    // Sessions se cargan automáticamente mediante el Observable sessions$
  }

  loadSessions(): Observable<Session[]> {
    return this.sessionService.getAllSessions().pipe(
      catchError((error) => {
        console.error('Error cargando sesiones:', error);
        this.error = error.error?.message || 'No se pudieron cargar las sesiones. Intenta de nuevo.';
        return of([]);
      })
    );
  }

  retryLoadSessions() {
    this.error = null;
    this.sessions$ = this.loadSessions();
  }

  createSession() {
    if (this.sessionForm.invalid) return;

    this.creatingSession = true;
    
    // Preparar datos en formato backend (español)
    const newSession: Partial<Session> = {
      titulo: this.sessionForm.value.title,
      tema: this.sessionForm.value.subject,
      duracion: this.sessionForm.value.duration,
      estado: 'en-curso' as const, // Type assertion para el literal
      pomodoroTime: 25,
      breakTime: 5,
      numPomodoros: 4
    };

    this.sessionService.createSession(newSession).subscribe({
      next: (response) => {
        console.log('✅ Sesión creada:', response);
        
        // Recargar sesiones después de crear
        this.sessions$ = this.loadSessions();
        this.sessionForm.reset({ duration: 90 });
        this.showCreateForm = false;
        this.creatingSession = false;

        // Navegar automáticamente a la sesión creada
        const sessionId = response.session?.id || response.id;
        if (sessionId) {
          this.router.navigate(['/sessions', sessionId, 'active']);
        }
      },
      error: (error) => {
        console.error('Error al crear sesión:', error);
        this.error = error.error?.message || 'No se pudo crear la sesión. Intenta de nuevo.';
        this.creatingSession = false;
      }
    });
  }

  /**
   * Navegar a la sesión activa
   */
  joinSession(session: Session) {
    const sessionId = session.id;
    console.log('🚀 Navegando a sesión:', sessionId);
    this.router.navigate(['/sessions', sessionId, 'active']);
  }

  /**
   * Helpers para el estado de la sesión
   */
  isActiveStatus(session: Session): boolean {
    const status = session.status || session.estado;
    return status === 'active' || status === 'en-curso';
  }

  isUpcomingStatus(session: Session): boolean {
    const status = session.status || session.estado;
    return status === 'upcoming' || status === 'planificado';
  }

  isCompletedStatus(session: Session): boolean {
    const status = session.status || session.estado;
    return status === 'completed' || status === 'finalizado';
  }

  getStatusText(session: Session): string {
    if (this.isActiveStatus(session)) return 'En vivo';
    if (this.isUpcomingStatus(session)) return 'Próxima';
    if (this.isCompletedStatus(session)) return 'Completada';
    return 'Desconocido';
  }

  /**
   * Obtener número de participantes (maneja tanto array como número)
   */
  getParticipantCount(session: Session): number {
    // Si participants es un array, retorna su longitud
    if (Array.isArray(session.participants)) {
      return session.participants.length;
    }
    
    // Si participantes es un array (español), retorna su longitud
    if (Array.isArray(session.participantes)) {
      return session.participantes.length;
    }
    
    // Si participants es un número, retorna ese número
    if (typeof session.participants === 'number') {
      return session.participants;
    }
    
    // Por defecto, 0
    return 0;
  }
}