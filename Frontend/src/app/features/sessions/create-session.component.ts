import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-session.component.html',
  styles: []
})
export class CreateSessionComponent {
  form: FormGroup;
  isLoading = false;
  error: string | null = null;
  accessCode: string = '';

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      categoria: ['matematicas'],
      pomodoroTime: ['25', Validators.required],
      breakTime: ['5', Validators.required],
      numPomodoros: ['1', Validators.required],
      maxParticipantes: ['5'],
      isPrivate: [false],
      enableChat: [true],
      allowLateJoin: [true],
      notifications: [true]
    });

    // Generar código de acceso cuando se marca como privada
    this.form.get('isPrivate')?.valueChanges.subscribe((isPrivate) => {
      if (isPrivate) {
        this.generateAccessCode();
      }
    });

    // Suscribirse a cambios en los campos del pomodoro para recalcular la duración
    this.form.get('pomodoroTime')?.valueChanges.subscribe(() => this.calculateDuration());
    this.form.get('breakTime')?.valueChanges.subscribe(() => this.calculateDuration());
    this.form.get('numPomodoros')?.valueChanges.subscribe(() => this.calculateDuration());
  }

  get totalDuration(): { hours: number; minutes: number; text: string } {
    const pomodoroTime = parseInt(this.form.get('pomodoroTime')?.value || '25', 10);
    const breakTime = parseInt(this.form.get('breakTime')?.value || '5', 10);
    const numPomodoros = parseInt(this.form.get('numPomodoros')?.value || '1', 10);

    // Cálculo: (pomodoros * pomodoroTime) + ((pomodoros - 1) * breakTime)
    const totalMinutes = (numPomodoros * pomodoroTime) + ((numPomodoros - 1) * breakTime);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let text = '';
    if (hours > 0) {
      text += `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (hours > 0) text += ' ';
      text += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }

    return { hours, minutes, text };
  }

  get pomodoroSummary(): string {
    const pomodoros = parseInt(this.form.get('numPomodoros')?.value || '1', 10);
    const pomodoroTime = parseInt(this.form.get('pomodoroTime')?.value || '25', 10);
    const breakTime = parseInt(this.form.get('breakTime')?.value || '5', 10);
    const breaks = Math.max(0, pomodoros - 1);

    return `${pomodoros} Pomodoro${pomodoros > 1 ? 's' : ''} de ${pomodoroTime} min + ${breaks} descanso${breaks > 1 || breaks === 0 ? 's' : ''} de ${breakTime} min`;
  }

  calculateDuration() {
    // Trigger change detection
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  generateAccessCode(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.accessCode = code;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      this.error = null;
      let formValue = this.form.value;
      
      // Convertir strings a números y mapear categoria a tema
      formValue = {
        ...formValue,
        tema: formValue.categoria, // Mapear categoria a tema
        pomodoroTime: parseInt(formValue.pomodoroTime),
        breakTime: parseInt(formValue.breakTime),
        numPomodoros: parseInt(formValue.numPomodoros),
        maxParticipantes: parseInt(formValue.maxParticipantes),
        accessCode: this.form.get('isPrivate')?.value ? this.accessCode : null
      };
      
      // Remover categoria del objeto ya que usamos tema
      delete formValue.categoria;
      
      console.log('Enviando sesión:', formValue);
      
      this.sessionService.createSession(formValue).subscribe({
        next: (response: any) => {
          console.log('✅ Sesión creada exitosamente:', response);
          this.isLoading = false;
          // Navegar a la lista de sesiones
          // La actualización automática ocurrirá gracias al Subject en SessionService
          this.router.navigate(['/sessions']);
        },
        error: (err: any) => {
          console.error('❌ Error completo:', err);
          this.isLoading = false;
          
          // Extraer el mensaje de error más específico
          let errorMessage = 'Error desconocido al crear la sesión';
          
          // Timeout error
          if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
            errorMessage = 'La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.';
          }
          // Connection refused
          else if (err.status === 0 && err.statusText === 'Unknown Error') {
            errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:4000';
          }
          // Backend error
          else if (err.error?.error) {
            errorMessage = err.error.error;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (err.statusText) {
            errorMessage = err.statusText;
          }
          
          this.error = errorMessage;
          console.error('Mensaje de error mostrado:', errorMessage);
        }
      });
    } else {
      console.error('Formulario inválido:', this.form.errors);
      this.error = 'Por favor completa todos los campos requeridos correctamente';
    }
  }

  onCancel() {
    this.router.navigate(['/sessions']);
  }
}
