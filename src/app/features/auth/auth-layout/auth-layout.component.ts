import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="auth-layout">
      <!-- Background with gradient and pattern -->
      <div class="auth-background">
        <div class="gradient-overlay"></div>
        <div class="pattern-overlay"></div>
      </div>
      
      <!-- Content area -->
      <div class="auth-content">
        <router-outlet></router-outlet>
      </div>
      
      <!-- Footer -->
      <div class="auth-footer">
        <p>&copy; 2024 Audit Sécurité. Tous droits réservés.</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .auth-background {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: -2;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
    }

    .pattern-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      background-size: 100px 100px;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .auth-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    .auth-footer {
      text-align: center;
      padding: 1rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      position: relative;
      z-index: 1;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .auth-background {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      }
      
      .gradient-overlay {
        background: linear-gradient(45deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .auth-content {
        padding: 1rem;
      }
      
      .auth-footer {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
    }
  `]
})
export class AuthLayoutComponent {}
