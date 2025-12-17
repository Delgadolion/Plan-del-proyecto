import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AchievementService, Achievement } from '../../core/services/achievement.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface ProgressItem {
  label: string;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent implements OnInit {
  currentUser: UserProfile | null = null;
  isEditOpen = false;
  editForm: FormGroup;
  isSaving = false;
  isLoadingProfile = false;
  isLoadingAchievements = false;
  saveMessage = '';
  error: string | null = null;

  statistics: Stat[] = [];
  progressItems: ProgressItem[] = [];
  featuredAchievements: Achievement[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private achievementService: AchievementService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
  }

  private loadProfileData(): void {
    this.isLoading = true;
    this.isLoadingProfile = true;
    this.isLoadingAchievements = true;
    this.error = null;

    // Cargar perfil del usuario actual
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        const user = response.usuario || response as any;
        if (user) {
          this.currentUser = user;
          this.editForm.patchValue({
            name: user.name,
            username: user.nombre,
            bio: user.bio
          });

          // Actualizar estadísticas
          this.statistics = [
            { label: 'Sesiones Creadas', value: 12, icon: '📝', color: 'bg-blue-500/10' },
            { label: 'Horas Estudio', value: 0, icon: '⏱️', color: 'bg-purple-500/10' },
            { label: 'Logros', value: 0, icon: '🏆', color: 'bg-yellow-500/10' }
          ];

          // Cargar progreso de estudio
          this.progressItems = [
            { label: 'Progreso de Estudio', percentage: 65, color: 'bg-blue-500' },
            { label: 'Racha Activa', percentage: 42, color: 'bg-orange-500' },
            { label: 'Cumplimiento de Metas', percentage: 78, color: 'bg-green-500' }
          ];
        }
        console.log('✅ Perfil cargado correctamente');
        this.isLoadingProfile = false;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil';
        this.isLoadingProfile = false;
        this.checkLoadingComplete();
      }
    });

    // Cargar logros destacados
    this.achievementService.getAllAchievements().subscribe({
      next: (achievements) => {
        this.featuredAchievements = achievements.filter(a => a.unlocked).slice(0, 3);
        console.log('✅ Logros cargados:', this.featuredAchievements);
        this.isLoadingAchievements = false;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('❌ Error al cargar logros:', err);
        this.isLoadingAchievements = false;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Solo terminar loading cuando ambas requests terminen
    if (!this.isLoadingProfile && !this.isLoadingAchievements) {
      this.isLoading = false;
    }
  }

  openEditDialog(): void {
    this.isEditOpen = true;
  }

  closeEditDialog(): void {
    this.isEditOpen = false;
  }

  saveProfile(): void {
    if (!this.editForm.valid || !this.currentUser) return;

    this.isSaving = true;
    console.log('💾 Guardando perfil...');
    
    const updates = {
      name: this.editForm.get('name')?.value,
      nombre: this.editForm.get('username')?.value,
      bio: this.editForm.get('bio')?.value
    };

    this.userService.updateProfile(updates).subscribe({
      next: (response) => {
        const updatedUser = response.usuario || response as any;
        if (updatedUser) {
          this.currentUser = updatedUser;
        }
        this.isSaving = false;
        this.saveMessage = '✅ Perfil actualizado correctamente';
        console.log('✅ Perfil guardado:', updatedUser);
        
        setTimeout(() => {
          this.isEditOpen = false;
        }, 1500);

        setTimeout(() => {
          this.saveMessage = '';
        }, 4000);
      },
      error: (err) => {
        console.error('❌ Error al guardar perfil:', err);
        this.isSaving = false;
        this.saveMessage = '❌ Error al guardar los cambios';
        setTimeout(() => {
          this.saveMessage = '';
        }, 4000);
      }
    });
  }

  uploadProfilePicture(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📷 Subiendo foto de perfil...');
    this.isSaving = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target.result;
      this.userService.updateProfile({ fotoPerfil: imageUrl }).subscribe({
        next: (response) => {
          const updatedUser = response.usuario || response as any;
          if (updatedUser) {
            this.currentUser = updatedUser;
          }
          this.isSaving = false;
          this.saveMessage = '✅ Foto actualizada';
          console.log('✅ Foto de perfil actualizada');
          
          setTimeout(() => {
            this.saveMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('❌ Error al subir foto:', err);
          this.isSaving = false;
          this.saveMessage = '❌ Error al subir foto';
          
          setTimeout(() => {
            this.saveMessage = '';
          }, 3000);
        }
      });
    };

    reader.readAsDataURL(file);
  }
}
