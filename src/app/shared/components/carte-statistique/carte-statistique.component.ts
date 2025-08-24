import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carte-statistique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-card-' + couleur">
      <div class="stat-icon">
        <span>{{ icone }}</span>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ valeur }}</h3>
        <p class="stat-label">{{ titre }}</p>
        <div class="stat-change" [class]="'stat-change-' + (changement > 0 ? 'positive' : changement < 0 ? 'negative' : 'neutral')" *ngIf="changement !== undefined">
          <span class="change-icon">{{ changement > 0 ? '↗️' : changement < 0 ? '↘️' : '➡️' }}</span>
          <span>{{ Math.abs(changement) }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card-primary .stat-icon {
      background-color: var(--primary-light);
      color: var(--primary-color);
    }

    .stat-card-success .stat-icon {
      background-color: #dcfce7;
      color: var(--success-color);
    }

    .stat-card-warning .stat-icon {
      background-color: #fef3c7;
      color: var(--warning-color);
    }

    .stat-card-danger .stat-icon {
      background-color: #fecaca;
      color: var(--error-color);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .stat-change-positive {
      color: var(--success-color);
    }

    .stat-change-negative {
      color: var(--error-color);
    }

    .stat-change-neutral {
      color: var(--text-secondary);
    }

    .change-icon {
      font-size: 0.875rem;
    }
  `]
})
export class CarteStatistiqueComponent {
  @Input() titre: string = '';
  @Input() valeur: string | number = '';
  @Input() icone: string = '📊';
  @Input() couleur: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
  @Input() changement?: number;

  Math = Math;
}