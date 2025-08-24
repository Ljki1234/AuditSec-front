import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container fade-in">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="logo-icon">🔒</span>
            <h1>AuditSec</h1>
          </div>
          <p class="auth-subtitle">Créez votre compte</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom</label>
              <input
                type="text"
                id="firstName"
                class="form-control"
                [(ngModel)]="registerData.firstName"
                name="firstName"
                required
                minlength="2"
                placeholder="Votre prénom"
                [class.invalid]="firstNameField.invalid && firstNameField.touched"
                #firstNameField="ngModel">
              <div class="error-message" *ngIf="firstNameField.invalid && firstNameField.touched">
                <span *ngIf="firstNameField.errors?.['required']">Le prénom est requis</span>
                <span *ngIf="firstNameField.errors?.['minlength']">Au moins 2 caractères</span>
              </div>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Nom</label>
              <input
                type="text"
                id="lastName"
                class="form-control"
                [(ngModel)]="registerData.lastName"
                name="lastName"
                required
                minlength="2"
                placeholder="Votre nom"
                [class.invalid]="lastNameField.invalid && lastNameField.touched"
                #lastNameField="ngModel">
              <div class="error-message" *ngIf="lastNameField.invalid && lastNameField.touched">
                <span *ngIf="lastNameField.errors?.['required']">Le nom est requis</span>
                <span *ngIf="lastNameField.errors?.['minlength']">Au moins 2 caractères</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Adresse email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              [(ngModel)]="registerData.email"
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
            <label for="company" class="form-label">Entreprise</label>
            <input
              type="text"
              id="company"
              class="form-control"
              [(ngModel)]="registerData.company"
              name="company"
              placeholder="Nom de votre entreprise (optionnel)">
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="form-control"
                [(ngModel)]="registerData.password"
                name="password"
                required
                minlength="8"
                placeholder="••••••••"
                [class.invalid]="passwordField.invalid && passwordField.touched"
                #passwordField="ngModel"
                (input)="checkPasswordStrength()">
              <button type="button" class="password-toggle" (click)="togglePassword()">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="password-strength" *ngIf="registerData.password.length > 0">
              <div class="strength-bar">
                <div class="strength-fill" [class]="'strength-' + passwordStrength.level" [style.width.%]="passwordStrength.percentage"></div>
              </div>
              <span class="strength-text" [class]="'text-' + passwordStrength.level">{{ passwordStrength.label }}</span>
            </div>
            <div class="error-message" *ngIf="passwordField.invalid && passwordField.touched">
              <span *ngIf="passwordField.errors?.['required']">Le mot de passe est requis</span>
              <span *ngIf="passwordField.errors?.['minlength']">Au moins 8 caractères</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              class="form-control"
              [(ngModel)]="registerData.confirmPassword"
              name="confirmPassword"
              required
              placeholder="••••••••"
              [class.invalid]="(confirmPasswordField.invalid || passwordMismatch()) && confirmPasswordField.touched"
              #confirmPasswordField="ngModel">
            <div class="error-message" *ngIf="(confirmPasswordField.invalid || passwordMismatch()) && confirmPasswordField.touched">
              <span *ngIf="confirmPasswordField.errors?.['required']">La confirmation est requise</span>
              <span *ngIf="passwordMismatch()">Les mots de passe ne correspondent pas</span>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="registerData.acceptTerms" name="acceptTerms" required #termsField="ngModel">
              <span class="checkmark"></span>
              J'accepte les <a href="#" class="link-primary">conditions d'utilisation</a> et la <a href="#" class="link-primary">politique de confidentialité</a>
            </label>
            <div class="error-message" *ngIf="termsField.invalid && termsField.touched">
              Vous devez accepter les conditions d'utilisation
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="registerData.newsletter" name="newsletter">
              <span class="checkmark"></span>
              Je souhaite recevoir les notifications par email
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Création...' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a href="#" class="link-primary">Se connecter</a></p>
        </div>
      </div>

      <div class="demo-info">
        <div class="info-card">
          <h3>🎯 Démonstration UI/UX</h3>
          <p>Formulaire d'inscription avec validation complète et indicateur de force du mot de passe.</p>
          <p>Toutes les validations sont fonctionnelles côté client.</p>
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
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .password-strength {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background-color: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-weak {
      background-color: var(--error-color);
    }

    .strength-medium {
      background-color: var(--warning-color);
    }

    .strength-strong {
      background-color: var(--success-color);
    }

    .strength-text {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .text-weak {
      color: var(--error-color);
    }

    .text-medium {
      color: var(--warning-color);
    }

    .text-strong {
      color: var(--success-color);
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1.4;
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
      flex-shrink: 0;
      margin-top: 0.125rem;
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
      margin: 0 0 0.5rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .demo-info {
        max-width: none;
      }
    }
  `]
})
export class InscriptionComponent {
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: true
  };

  showPassword = false;
  isLoading = false;
  passwordStrength = {
    level: 'weak',
    percentage: 0,
    label: ''
  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordMismatch(): boolean {
    return this.registerData.password !== this.registerData.confirmPassword && 
           this.registerData.confirmPassword.length > 0;
  }

  checkPasswordStrength() {
    const password = this.registerData.password;
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      this.passwordStrength = {
        level: 'weak',
        percentage: 33,
        label: 'Faible'
      };
    } else if (score <= 3) {
      this.passwordStrength = {
        level: 'medium',
        percentage: 66,
        label: 'Moyen'
      };
    } else {
      this.passwordStrength = {
        level: 'strong',
        percentage: 100,
        label: 'Fort'
      };
    }
  }

  onSubmit() {
    if (!this.isLoading) {
      this.isLoading = true;
      // Simulation d'une requête
      setTimeout(() => {
        this.isLoading = false;
        console.log('Démonstration: Données d\'inscription', this.registerData);
        // Ici, normalement on redirigerait vers une page de confirmation
      }, 2000);
    }
  }
}