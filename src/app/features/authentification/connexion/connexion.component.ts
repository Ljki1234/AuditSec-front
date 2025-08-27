import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container fade-in">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="logo-icon">🔒</span>
            <h1>AuditSec</h1>
          </div>
          <p class="auth-subtitle">Connectez-vous à votre compte</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email" class="form-label">Adresse email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              [(ngModel)]="loginData.email"
              name="email"
              required
              email
              placeholder="votre&#64;email.com"
              [class.invalid]="emailField.invalid && emailField.touched"
              #emailField="ngModel">
            <div class="error-message" *ngIf="emailField.invalid && emailField.touched">
              <span *ngIf="emailField.errors?.['required']">L'email est requis</span>
              <span *ngIf="emailField.errors?.['email']">Format d'email invalide</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="form-control"
                [(ngModel)]="loginData.password"
                name="password"
                required
                minlength="6"
                placeholder="••••••••"
                [class.invalid]="passwordField.invalid && passwordField.touched"
                #passwordField="ngModel">
              <button type="button" class="password-toggle" (click)="togglePassword()">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="error-message" *ngIf="passwordField.invalid && passwordField.touched">
              <span *ngIf="passwordField.errors?.['required']">Le mot de passe est requis</span>
              <span *ngIf="passwordField.errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères</span>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="loginData.rememberMe" name="rememberMe">
              <span class="checkmark"></span>
              Se souvenir de moi
            </label>
            <a routerLink="/forgot-password" class="link-secondary">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Pas encore de compte ? <a routerLink="/register" class="link-primary">S'inscrire</a></p>
        </div>
      </div>

      <!-- Messages de démonstration -->
      <div class="demo-info">
        <div class="info-card">
          <h3>🎯 Démonstration UI/UX</h3>
          <p>Cette page présente uniquement l'interface utilisateur. Aucune authentification réelle n'est implémentée.</p>
          <div class="demo-credentials">
            <strong>Données de test :</strong><br>
            Email: admin&#64;example.com<br>
            Mot de passe: 123456
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%);
      padding: 1rem;
      gap: 2rem;
    }

    .auth-card {
      background-color: var(--bg-primary);
      border-radius: 1rem;
      box-shadow: var(--shadow-lg);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border-color);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-logo h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .auth-subtitle {
      color: var(--text-secondary);
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .password-input {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-secondary);
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: color 0.2s ease;
    }

    .password-toggle:hover {
      color: var(--text-primary);
    }

    .form-options {
      display: flex;
      justify-content: between;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border-color);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .link-secondary {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }

    .link-secondary:hover {
      color: var(--primary-color);
    }

    .link-primary {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .link-primary:hover {
      text-decoration: underline;
    }

    .btn-full {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      position: relative;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      color: var(--text-secondary);
      margin: 0;
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .form-control.invalid {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .demo-info {
      max-width: 300px;
    }

    .info-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--info-color);
    }

    .info-card h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .info-card p {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .demo-credentials {
      background-color: var(--bg-secondary);
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
      }

      .demo-info {
        max-width: none;
      }
    }
  `]
})
export class ConnexionComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.isLoading) {
      this.isLoading = true;
      // Simulation d'une requête
      setTimeout(() => {
        this.isLoading = false;
        console.log('Démonstration: Données de connexion', this.loginData);
        // Ici, normalement on redirigerait vers le tableau de bord
      }, 2000);
    }
  }
}