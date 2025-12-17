import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { SessionService } from '../../core/services/session.service';
import { Session } from '../../core/models/session.model';
import { UserService, UserProfile } from '../../core/services/user.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  sessions: Session[] = [];
  currentUser: UserProfile | null = null;
  isLoading = true;
  isLoadingSessions = false;
  isLoadingUser = false;
  error: string | null = null;

  stats: Stat[] = [
    { label: 'Sesiones Creadas', value: 0, icon: '📚', color: 'bg-blue-500/10' },
    { label: 'Participantes', value: 0, icon: '👥', color: 'bg-purple-500/10' },
    { label: 'Logros', value: 0, icon: '🏆', color: 'bg-yellow-500/10' },
    { label: 'Horas Estudio', value: 0, icon: '⏱️', color: 'bg-green-500/10' }
  ];

  constructor(
    private sessionService: SessionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.isLoadingSessions = true;
    this.isLoadingUser = true;
    this.error = null;

    // Cargar sesiones activas (sin privadas)
    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions
          .filter(s => (s.estado === 'en-curso' || s.estado === 'planificado') && !s.isPrivate)
          .slice(0, 3);
        console.log('✅ Sesiones activas cargadas:', this.sessions);
        this.isLoadingSessions = false;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('❌ Error al cargar sesiones:', err);
        this.error = 'No se pudieron cargar las sesiones';
        this.isLoadingSessions = false;
        this.checkLoadingComplete();
      }
    });

    // Cargar perfil del usuario actual
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        const user = response.usuario || response as any;
        if (user) {
          this.currentUser = user;
          this.updateStats(user);
        }
        console.log('✅ Perfil de usuario cargado:', user);
        this.isLoadingUser = false;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        this.isLoadingUser = false;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Solo terminar loading cuando ambas requests terminen
    if (!this.isLoadingSessions && !this.isLoadingUser) {
      this.isLoading = false;
    }
  }

  private updateStats(user: UserProfile): void {
    this.stats[0].value = this.sessions.length;
    this.stats[1].value = 8; // Participantes simulados
    this.stats[2].value = 0; // Logros del usuario
    this.stats[3].value = 0; // Horas de estudio
  }

  retryLoadDashboard(): void {
    this.loadDashboardData();
  }

  getProgressPercentage(participants: number, max: number): number {
    return (participants / max) * 100;
  }
}
