import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('system');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
    this.applyTheme();
  }

  private loadTheme() {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      this.themeSubject.next(saved);
    } else {
      this.themeSubject.next('system');
    }
  }

  setTheme(theme: Theme) {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.themeSubject.value;
    const isDark = theme === 'dark' || 
                   (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
