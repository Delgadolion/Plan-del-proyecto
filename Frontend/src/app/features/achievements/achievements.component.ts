import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HeaderComponent } from "../../shared/components/header.component";
import { FooterComponent } from "../../shared/components/footer.component";
import { AchievementService, Achievement } from "../../core/services/achievement.service";
import { Observable, of } from "rxjs";

@Component({
  selector: "app-achievements",
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: "./achievements.component.html",
  styles: []
})
export class AchievementsComponent implements OnInit {
  private achievementService = inject(AchievementService);
  
  achievements: Achievement[] = [];
  filterStatus: 'all' | 'unlocked' | 'locked' = 'all';
  filterCategory: string = 'all';
  categories: string[] = [];
  loading = false;
  error: string | null = null;
  achievementStats: any = {};

  ngOnInit() {
    this.loadAchievements();
  }

  loadAchievements(): void {
    this.loading = true;
    this.error = null;

    // Cargar todos los logros
    this.achievementService.getAllAchievements().subscribe({
      next: (achievements) => {
        this.achievements = achievements;
        this.updateCategories(achievements);
        this.loadStats();
        this.loading = false;
        console.log('✅ Logros cargados:', achievements);
      },
      error: (err) => {
        console.error('❌ Error cargando logros:', err);
        this.error = 'No se pudieron cargar los logros. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  private loadStats(): void {
    this.achievementService.getAchievementStats().subscribe({
      next: (stats) => {
        this.achievementStats = stats;
        console.log('📊 Estadísticas de logros:', stats);
      },
      error: (err) => console.error('❌ Error al cargar estadísticas:', err)
    });
  }

  retryLoadAchievements(): void {
    this.loadAchievements();
  }

  getFilteredAchievements(): Achievement[] {
    let filtered = this.achievements;

    // Filtrar por estado (unlocked/locked)
    if (this.filterStatus === 'unlocked') {
      filtered = filtered.filter(a => a.unlocked);
    } else if (this.filterStatus === 'locked') {
      filtered = filtered.filter(a => !a.unlocked);
    }

    // Filtrar por categoría
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(a => a.category === this.filterCategory);
    }

    return filtered;
  }

  updateCategories(achievements: Achievement[]): void {
    const uniqueCategories = [...new Set(achievements.map(a => a.category))];
    this.categories = ['all', ...uniqueCategories];
  }

  getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getUnlockedPercentage(): number {
    return this.achievements.length > 0 
      ? Math.round((this.getUnlockedCount() / this.achievements.length) * 100)
      : 0;
  }

  calculateStrokeDasharray(): string {
    const circumference = 282.6;
    const percentage = this.getUnlockedPercentage() / 100;
    const dashLength = circumference * percentage;
    return `${dashLength} ${circumference}`;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'general': 'General',
      'tiempo': 'Tiempo',
      'racha': 'Racha',
      'social': 'Social',
      'study': 'Estudio',
      'consistency': 'Consistencia',
      'achievement': 'Logros'
    };
    return labels[category] || category;
  }
}
