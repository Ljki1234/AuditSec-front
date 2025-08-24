import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="logo-section">
            <div class="logo-icon">
              <mat-icon>lock_reset</mat-icon>
            </div>
            <h1>AuditSec</h1>
          </div>
          <p class="auth-subtitle">Mot de passe oublié</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="isEmailSent" class="success-banner">
          <mat-icon>check_circle</mat-icon>
          <div class="success-content">
            <span class="success-title">Email envoyé avec succès</span>
            <span class="success-message">
              Un lien de réinitialisation a été envoyé à votre adresse email. 
              Vérifiez votre boîte de réception et vos spams.
            </span>
          </div>
        </div>

        <!-- Error Banner -->
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Forgot Password Form -->
        <form *ngIf="!isEmailSent" [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-description">
            <p>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <!-- Email Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              type="email" 
              formControlName="email" 
              placeholder="votre&#64;email.com"
              [attr.aria-label]="'Email'"
              autocomplete="email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>

          <!-- Submit Button -->
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            class="submit-button"
            [disabled]="forgotPasswordForm.invalid || isLoading"
            [attr.aria-label]="'Envoyer le lien de réinitialisation'">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
            <span *ngIf="!isLoading">Envoyer le lien</span>
          </button>
        </form>

        <!-- Action Buttons -->
        <div class="auth-actions">
          <button 
            *ngIf="!isEmailSent"
            mat-button 
            routerLink="/login"
            class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Retour à la connexion
          </button>
          
          <button 
            *ngIf="isEmailSent"
            mat-raised-button 
            color="primary"
            routerLink="/login"
            class="login-button">
            <mat-icon>login</mat-icon>
            Aller à la connexion
          </button>
        </div>

        <!-- Footer -->
        <div class="auth-footer">
          <p>Pas encore de compte ? 
            <a routerLink="/register" class="link-primary">S'inscrire</a>
          </p>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <mat-icon>security</mat-icon>
          <span>Le lien de réinitialisation expire dans 1 heure</span>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
      position: relative;
      overflow: hidden;
    }

    .auth-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .logo-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .auth-subtitle {
      color: #718096;
      margin: 0;
      font-size: 1rem;
    }

    .success-banner {
      background: #c6f6d5;
      border: 1px solid #9ae6b4;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      color: #22543d;
    }

    .success-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .success-title {
      font-weight: 600;
      font-size: 1rem;
    }

    .success-message {
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .error-banner {
      background: #fed7d7;
      border: 1px solid #feb2b2;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #c53030;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-description {
      text-align: center;
      color: #718096;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .form-description p {
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      position: relative;
    }

    .spinner {
      margin-right: 0.5rem;
    }

    .auth-actions {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #718096;
    }

    .login-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 48px;
      font-weight: 600;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .auth-footer p {
      margin: 0;
      color: #718096;
    }

    .link-primary {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .link-primary:hover {
      color: #5a67d8;
      text-decoration: underline;
    }

    .security-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
      color: #718096;
      font-size: 0.875rem;
    }

    .security-notice mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .auth-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .auth-header h1 {
        font-size: 1.75rem;
      }

      .success-banner {
        padding: 1rem;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .auth-card {
        background: rgba(26, 32, 44, 0.95);
        color: white;
      }

      .auth-header h1 {
        color: white;
      }

      .auth-subtitle {
        color: #a0aec0;
      }

      .form-description {
        color: #a0aec0;
      }

      .security-notice {
        background: rgba(45, 55, 72, 0.5);
        color: #a0aec0;
      }
    }
  `]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isEmailSent = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
        this.errorMessage = state.error || '';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isEmailSent = true;
          this.snackBar.open('Email envoyé avec succès!', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          this.snackBar.open('Erreur lors de l\'envoi de l\'email', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}
