import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer.component';
import { HeaderComponent } from '../../shared/components/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    HeaderComponent
  ],
  template: `
    <div style="display: flex; flex-direction: column; min-height: 100vh; background-color: hsl(var(--background)); color: hsl(var(--foreground));">
      <app-header></app-header>

      <main style="flex: 1;">
        <!-- Hero Section -->
        <section style="position: relative; overflow: hidden; background: linear-gradient(to bottom right, rgba(59,130,246,0.1), hsl(var(--background)), rgba(240,10%,50%,0.1)); padding: 5rem 1rem; margin-bottom: 3rem;">
          <!-- Blur decorativos -->
          <div style="position: absolute; top: -50px; left: -50px; width: 18rem; height: 18rem; border-radius: 50%; background-color: rgba(59,130,246,0.2); filter: blur(60px); z-index: 0;"></div>
          <div style="position: absolute; bottom: -50px; right: -50px; width: 18rem; height: 18rem; border-radius: 50%; background-color: rgba(240,10%,50%,0.2); filter: blur(60px); z-index: 0;"></div>

          <div class="container" style="max-width: 56rem; text-align: center; position: relative; z-index: 10; margin: 0 auto;">
            <!-- Badge -->
            <div style="display: inline-flex; gap: 0.5rem; border-radius: 9999px; background-color: rgba(59,130,246,0.1); padding: 0.5rem 1rem; margin-bottom: 2rem; font-size: 0.875rem; font-weight: 500; color: hsl(var(--primary));">
              <span style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: hsl(var(--primary)); animation: pulse 2s infinite;"></span>
              Método Pomodoro para máxima productividad
            </div>

            <!-- Heading -->
            <h1 style="font-size: clamp(2rem, 5vw, 3.75rem); font-weight: bold; letter-spacing: -0.02em; margin-bottom: 1rem; color: hsl(var(--foreground));">
              Estudia <span style="background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">juntos</span>
            </h1>

            <!-- Descripción -->
            <p style="font-size: 1.125rem; color: hsl(var(--muted-foreground)); margin-bottom: 2rem; max-width: 42rem; margin-left: auto; margin-right: auto;">
              Crea sesiones de estudio colaborativas con cronómetro Pomodoro integrado. Mejora tu productividad y conecta con otros estudiantes.
            </p>

            <!-- Botones CTA -->
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem; align-items: center; justify-content: center;">
              <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                <button
                  routerLink="/sessions/create"
                  style="padding: 0.75rem 2rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; transition: opacity 0.3s; display: inline-flex; align-items: center; gap: 0.5rem;"
                  (mouseenter)="onMouseEnter($event)"
                  (mouseleave)="onMouseLeave($event)"
                >
                  ➕ Crear Sesión
                </button>
                <button
                  routerLink="/sessions"
                  style="padding: 0.75rem 2rem; border: 1px solid hsl(var(--border)); background-color: transparent; color: hsl(var(--foreground)); border-radius: 0.375rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s; display: inline-flex; align-items: center; gap: 0.5rem;"
                  (mouseenter)="onMouseEnterBg($event)"
                  (mouseleave)="onMouseLeaveBg($event)"
                >
                  👥 Unirse a una Sesión
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section style="padding: 2rem 1rem; margin-bottom: 3rem;">
          <div class="container" style="max-width: 80rem; margin: 0 auto;">
            <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 3rem; color: hsl(var(--foreground));">Características principales</h2>
            
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
              <!-- Feature 1 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⏱️</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Pomodoro Integrado</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Gestiona sesiones de 25 minutos con descansos automáticos.</p>
              </div>

              <!-- Feature 2 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">👥</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Estudia en Grupo</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Crea o únete a sesiones con otros estudiantes en tiempo real.</p>
              </div>

              <!-- Feature 3 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🏆</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Logros y Recompensas</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Desbloquea insignias por tus logros de estudio.</p>
              </div>

              <!-- Feature 4 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">💬</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Chat Instantáneo</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Comunicate con participantes durante la sesión.</p>
              </div>

              <!-- Feature 5 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Estadísticas</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Visualiza tu progreso y horas de estudio acumuladas.</p>
              </div>

              <!-- Feature 6 -->
              <div class="card" style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🔐</div>
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Privacidad</h3>
                <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Crea sesiones privadas o públicas con control total.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section style="background-color: hsl(var(--card)); border-top: 1px solid hsl(var(--border)); border-bottom: 1px solid hsl(var(--border)); padding: 3rem 1rem; margin-bottom: 3rem;">
          <div class="container" style="max-width: 80rem; margin: 0 auto;">
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center;">
              <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 0.5rem;">📚</div>
                <p style="color: hsl(var(--muted-foreground));">Estudia Colaborativamente</p>
              </div>
              <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 0.5rem;">⏰</div>
                <p style="color: hsl(var(--muted-foreground));">Gestiona tu Tiempo</p>
              </div>
              <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 0.5rem;">🎯</div>
                <p style="color: hsl(var(--muted-foreground));">Alcanza Tus Metas</p>
              </div>
              <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: hsl(var(--primary)); margin-bottom: 0.5rem;">🌟</div>
                <p style="color: hsl(var(--muted-foreground));">Gana Logros</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Final -->
        <section style="text-align: center; padding: 3rem 1rem; margin: 0 auto;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: hsl(var(--foreground));">¿Listo para estudiar?</h2>
          <p style="color: hsl(var(--muted-foreground)); margin-bottom: 2rem; font-size: 1.125rem;">Únete a miles de estudiantes en sesiones colaborativas hoy.</p>
          <button
            routerLink="/register"
            style="padding: 0.75rem 2rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; font-size: 1rem; transition: opacity 0.3s;"
            (mouseenter)="onMouseEnter($event)"
            (mouseleave)="onMouseLeave($event)"
          >
            Crear Cuenta Gratuita
          </button>
        </section>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {
    // Si el usuario ya está logeado, redirigir inmediatamente en el constructor
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    // Verificación adicional en ngOnInit
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onMouseEnter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.opacity = '0.9';
  }

  onMouseLeave(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.opacity = '1';
  }

  onMouseEnterBg(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.backgroundColor = 'hsl(var(--muted))';
  }

  onMouseLeaveBg(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.backgroundColor = 'transparent';
  }
}
