import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer style="border-top: 1px solid hsl(var(--border)); background-color: hsl(var(--background));">
      <div class="container" style="padding: 2rem 1rem; max-width: 80rem; margin: 0 auto;">
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: space-between; text-align: center;">
          <div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; font-size: 0.875rem; color: hsl(var(--muted-foreground));">
            <a href="/privacy" style="text-decoration: none; color: hsl(var(--muted-foreground)); cursor: pointer; transition: color 0.3s;" (mouseenter)="onMouseEnterLink($event)" (mouseleave)="onMouseLeaveLink($event)">
              Política de privacidad
            </a>
            <a href="/terms" style="text-decoration: none; color: hsl(var(--muted-foreground)); cursor: pointer; transition: color 0.3s;" (mouseenter)="onMouseEnterLink($event)" (mouseleave)="onMouseLeaveLink($event)">
              Términos y condiciones
            </a>
          </div>
          <div style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">
            Derechos reservados @Estudiamos {{ currentYear }}
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  onMouseEnterLink(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.color = 'hsl(var(--foreground))';
  }

  onMouseLeaveLink(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target) target.style.color = 'hsl(var(--muted-foreground))';
  }
}
