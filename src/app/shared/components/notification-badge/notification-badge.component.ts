import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="notification-badge" *ngIf="count > 0">
      {{ count > 99 ? '99+' : count }}
    </span>
  `,
  styles: [`
    .notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: var(--error-color);
      color: white;
      border-radius: 50px;
      padding: 0.125rem 0.375rem;
      font-size: 0.625rem;
      font-weight: 600;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class NotificationBadgeComponent {
  @Input() count: number = 0;
}