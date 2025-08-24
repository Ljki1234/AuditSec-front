import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
    MatCardModule,
    MatProgressBarModule
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
          <p class="auth-subtitle">Réinitialiser le mot de passe</p>
        </div>

        <!-- Token Validation Loading -->
        <div *ngIf="isValidatingToken" class="validation-loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Validation du lien de réinitialisation...</p>
        </div>

        <!-- Invalid Token -->
        <div *ngIf="!isValidatingToken && !isTokenValid" class="invalid-token">
          <mat-icon>error</mat-icon>
          <div class="invalid-token-content">
            <h3>Lien invalide ou expiré</h3>
            <p>Ce lien de réinitialisation n'est plus valide ou a expiré. Veuillez demander un nouveau lien.</p>
            <button mat-raised-button color="primary" routerLink="/forgot-password">
              Demander un nouveau lien
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="isPasswordReset" class="success-banner">
          <mat-icon>check_circle</mat-icon>
          <div class="success-content">
            <span class="success-title">Mot de passe réinitialisé avec succès</span>
            <span class="success-message">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </span>
          </div>
        </div>

        <!-- Error Banner -->
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Reset Password Form -->
        <form *ngIf="!isValidatingToken && isTokenValid && !isPasswordReset" [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Password Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nouveau mot de passe</mat-label>
            <input 
              matInput 
              [type]="showPassword ? 'text' : 'password'" 
              formControlName="password"
              placeholder="••••••••"
              [attr.aria-label]="'Nouveau mot de passe'"
              autocomplete="new-password">
            <mat-icon matSuffix>lock</mat-icon>
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="togglePassword()"
              [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('required')">
              Le mot de passe est requis
            </mat-error>
            <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('minlength')">
              Le mot de passe doit contenir au moins 8 caractères
            </mat-error>
          </mat-form-field>

          <!-- Password Strength Indicator -->
          <div *ngIf="resetPasswordForm.get('password')?.value" class="password-strength">
            <div class="strength-bar">
              <mat-progress-bar 
                [value]="getPasswordStrength()" 
                [color]="getPasswordStrengthColor()">
              </mat-progress-bar>
            </div>
            <div class="strength-text">
              <span [class]="getPasswordStrengthClass()">
                {{ getPasswordStrengthText() }}
              </span>
            </div>
          </div>

          <!-- Password Requirements -->
          <div *ngIf="resetPasswordForm.get('password')?.value" class="password-requirements">
            <div class="requirement" [class.valid]="hasMinLength()">
              <mat-icon>{{ hasMinLength() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Au moins 8 caractères</span>
            </div>
            <div class="requirement" [class.valid]="hasUppercase()">
              <mat-icon>{{ hasUppercase() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Au moins une majuscule</span>
            </div>
            <div class="requirement" [class.valid]="hasLowercase()">
              <mat-icon>{{ hasLowercase() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Au moins une minuscule</span>
            </div>
            <div class="requirement" [class.valid]="hasNumber()">
              <mat-icon>{{ hasNumber() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Au moins un chiffre</span>
            </div>
            <div class="requirement" [class.valid]="hasSpecialChar()">
              <mat-icon>{{ hasSpecialChar() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Au moins un caractère spécial</span>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le nouveau mot de passe</mat-label>
            <input 
              matInput 
              [type]="showConfirmPassword ? 'text' : 'password'" 
              formControlName="confirmPassword"
              placeholder="••••••••"
              [attr.aria-label]="'Confirmer le nouveau mot de passe'"
              autocomplete="new-password">
            <mat-icon matSuffix>lock</mat-icon>
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="toggleConfirmPassword()"
              [attr.aria-label]="showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
              <mat-icon>{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('required')">
              La confirmation du mot de passe est requise
            </mat-error>
            <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Les mots de passe ne correspondent pas
            </mat-error>
          </mat-form-field>

          <!-- Submit Button -->
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            class="submit-button"
            [disabled]="resetPasswordForm.invalid || isLoading"
            [attr.aria-label]="'Réinitialiser le mot de passe'">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
            <span *ngIf="!isLoading">Réinitialiser le mot de passe</span>
          </button>
        </form>

        <!-- Action Buttons -->
        <div class="auth-actions">
          <button 
            *ngIf="!isValidatingToken && isTokenValid && !isPasswordReset"
            mat-button 
            routerLink="/login"
            class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Retour à la connexion
          </button>
          
          <button 
            *ngIf="isPasswordReset"
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
          <span>Votre nouveau mot de passe est sécurisé et chiffré</span>
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
      max-width: 500px;
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

    .validation-loading {
      text-align: center;
      padding: 2rem;
      color: #718096;
    }

    .validation-loading p {
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .invalid-token {
      text-align: center;
      padding: 2rem;
      color: #c53030;
    }

    .invalid-token mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .invalid-token-content h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    .invalid-token-content p {
      margin: 0 0 1.5rem 0;
      color: #718096;
      line-height: 1.5;
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

    .full-width {
      width: 100%;
    }

    .password-strength {
      margin-top: -0.5rem;
    }

    .strength-bar {
      margin-bottom: 0.5rem;
    }

    .strength-text {
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .strength-text.weak {
      color: #e53e3e;
    }

    .strength-text.fair {
      color: #d69e2e;
    }

    .strength-text.good {
      color: #38a169;
    }

    .strength-text.strong {
      color: #2f855a;
    }

    .password-requirements {
      background: #f7fafc;
      border-radius: 8px;
      padding: 1rem;
      margin-top: -0.5rem;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
    }

    .requirement:last-child {
      margin-bottom: 0;
    }

    .requirement.valid {
      color: #38a169;
    }

    .requirement mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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

      .password-requirements {
        background: rgba(45, 55, 72, 0.5);
      }

      .security-notice {
        background: rgba(45, 55, 72, 0.5);
        color: #a0aec0;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isValidatingToken = true;
  isTokenValid = false;
  isPasswordReset = false;
  errorMessage = '';
  private token = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token from route params
    this.route.params.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.isValidatingToken = false;
        this.isTokenValid = false;
      }
    });

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

  private validateToken(): void {
    this.authService.validateResetToken(this.token).subscribe({
      next: (validation) => {
        this.isValidatingToken = false;
        this.isTokenValid = validation.valid;
        
        if (!validation.valid) {
          this.errorMessage = validation.message || 'Token invalide ou expiré';
        }
      },
      error: (error) => {
        this.isValidatingToken = false;
        this.isTokenValid = false;
        this.errorMessage = 'Erreur lors de la validation du token';
        console.error('Token validation error:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.isLoading && this.isTokenValid) {
      const newPassword = this.resetPasswordForm.value.password;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.isPasswordReset = true;
          this.snackBar.open('Mot de passe réinitialisé avec succès!', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Reset password error:', error);
          this.snackBar.open('Erreur lors de la réinitialisation', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Password strength validator
  private passwordStrengthValidator() {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const password = control.value;
      if (!password) return null;

      const hasMinLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const strength = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
        .filter(Boolean).length;

      return strength >= 3 ? null : { weakPassword: true };
    };
  }

  // Password match validator
  private passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Password strength methods
  getPasswordStrength(): number {
    const password = this.resetPasswordForm.get('password')?.value;
    if (!password) return 0;

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;

    return (strength / 5) * 100;
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'warn';
    if (strength < 80) return 'accent';
    return 'primary';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Faible';
    if (strength < 60) return 'Moyen';
    if (strength < 80) return 'Bon';
    return 'Fort';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'weak';
    if (strength < 60) return 'fair';
    if (strength < 80) return 'good';
    return 'strong';
  }

  // Password requirement checks
  hasMinLength(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password && password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password && /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password && /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }
}
