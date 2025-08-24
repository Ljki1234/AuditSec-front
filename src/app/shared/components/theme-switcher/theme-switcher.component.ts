import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="isDark ? 'Activer le thème clair' : 'Activer le thème sombre'">
      <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: var(--bg-secondary);
    }

    .theme-toggle:hover {
      background-color: var(--bg-tertiary);
      border-color: var(--primary-color);
      transform: scale(1.05);
    }

    .theme-icon {
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }

    .theme-toggle:hover .theme-icon {
      transform: rotate(180deg);
    }
  `]
})
export class ThemeSwitcherComponent implements OnInit {
  isDark = false;

  ngOnInit() {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDark = savedTheme === 'dark';
    } else {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}