import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkTheme = signal(true); // Default dark

  constructor() {
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme.set(!this.isDarkTheme());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkTheme()) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}
