import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { UserService, UserProfile } from '../../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './settings.component.html',
  styles: []
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  
  activeTab: string = 'account';
  currentUser: UserProfile | null = null;
  isLoading = false;
  isSaving = false;
  saveMessage = '';

  // Account Settings Form
  accountForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    bio: ['', Validators.required]
  });

  // Preferences Form
  preferencesForm: FormGroup = this.fb.group({
    emailNotifications: [true],
    studyReminders: [true],
    soundNotifications: [false],
    theme: ['light'],
    language: ['es']
  });

  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' }
  ];

  themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' }
  ];

  ngOnInit(): void {
    this.loadUserData();
    this.loadPreferences();
  }

  private loadUserData(): void {
    this.isLoading = true;
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        const user = response.usuario || response as any;
        if (user) {
          this.currentUser = user;
          this.accountForm.patchValue({
            email: user.email,
            nombre: user.name || user.nombre,
            username: user.nombre,
            bio: user.bio || ''
          });
        }
        this.isLoading = false;
        console.log('✅ Datos de usuario cargados');
      },
      error: (err) => {
        console.error('❌ Error al cargar usuario:', err);
        this.isLoading = false;
      }
    });
  }

  private loadPreferences(): void {
    // Cargar preferencias desde localStorage
    const preferences = localStorage.getItem('userPreferences');
    if (preferences) {
      try {
        const prefs = JSON.parse(preferences);
        this.preferencesForm.patchValue(prefs);
      } catch (err) {
        console.error('Error al cargar preferencias:', err);
      }
    }
  }

  saveAccountSettings(): void {
    if (!this.accountForm.valid || !this.currentUser) {
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    const updates = {
      email: this.accountForm.get('email')?.value,
      name: this.accountForm.get('nombre')?.value,
      nombre: this.accountForm.get('nombre')?.value,
      bio: this.accountForm.get('bio')?.value
    };

    this.userService.updateProfile(updates).subscribe({
      next: (response) => {
        const updatedUser = response.usuario || response as any;
        if (updatedUser) {
          this.currentUser = updatedUser;
        }
        this.isSaving = false;
        this.saveMessage = '✅ Configuración guardada correctamente';
        console.log('✅ Configuración guardada:', updatedUser);
        
        setTimeout(() => {
          this.saveMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        this.isSaving = false;
        this.saveMessage = '❌ Error al guardar los cambios';
      }
    });
  }

  savePreferences(): void {
    if (!this.preferencesForm.valid) {
      return;
    }

    this.isSaving = true;
    const preferences = this.preferencesForm.value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    this.isSaving = false;
    this.saveMessage = '✅ Preferencias guardadas correctamente';
    console.log('✅ Preferencias guardadas:', preferences);
    
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
    this.saveMessage = '';
  }
}
