import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="logo-section">
            <div class="logo-icon">
              <mat-icon>security</mat-icon>
            </div>
            <h1>AuditSec</h1>
          </div>
          <p class="auth-subtitle">Créer votre compte</p>
        </div>

        <!-- Error Banner -->
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Username Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <input 
              matInput 
              formControlName="username" 
              placeholder="votre_nom_utilisateur"
              [attr.aria-label]="'Nom dutilisateur'"
              autocomplete="username">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
              Le nom d'utilisateur est requis
            </mat-error>
            <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
              Le nom d'utilisateur doit contenir au moins 3 caractères
            </mat-error>
            <mat-error *ngIf="registerForm.get('username')?.hasError('pattern')">
              Le nom d'utilisateur ne peut contenir que des lettres, chiffres et tirets
            </mat-error>
          </mat-form-field>

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
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>

          <!-- Password Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input 
              matInput 
              [type]="showPassword ? 'text' : 'password'" 
              formControlName="password"
              placeholder="••••••••"
              [attr.aria-label]="'Mot de passe'"
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
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Le mot de passe est requis
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Le mot de passe doit contenir au moins 8 caractères
            </mat-error>
          </mat-form-field>

          <!-- Password Strength Indicator -->
          <div *ngIf="registerForm.get('password')?.value" class="password-strength">
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
          <div *ngIf="registerForm.get('password')?.value" class="password-requirements">
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
            <mat-label>Confirmer le mot de passe</mat-label>
            <input 
              matInput 
              [type]="showConfirmPassword ? 'text' : 'password'" 
              formControlName="confirmPassword"
              placeholder="••••••••"
              [attr.aria-label]="'Confirmer le mot de passe'"
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
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              La confirmation du mot de passe est requise
            </mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Les mots de passe ne correspondent pas
            </mat-error>
          </mat-form-field>

          <!-- Terms and Conditions -->
          <div class="form-options">
            <mat-checkbox formControlName="acceptTerms" color="primary">
              J'accepte les <a href="#" class="link-primary">conditions d'utilisation</a> et la 
              <a href="#" class="link-primary">politique de confidentialité</a>
            </mat-checkbox>
          </div>

          <!-- Submit Button -->
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            class="submit-button"
            [disabled]="registerForm.invalid || isLoading"
            [attr.aria-label]="'Créer le compte'">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
            <span *ngIf="!isLoading">Créer le compte</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <p>Déjà un compte ? 
            <a routerLink="/login" class="link-primary">Se connecter</a>
          </p>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <mat-icon>security</mat-icon>
          <span>Vos données sont protégées et chiffrées</span>
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

    .form-options {
      margin-top: -0.5rem;
    }

    .form-options a {
      color: #667eea;
      text-decoration: none;
    }

    .form-options a:hover {
      text-decoration: underline;
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
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
        this.errorMessage = state.error || '';

        if (state.isAuthenticated) {
          this.router.navigate(['/tableau-de-bord']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      const userData: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.snackBar.open('Compte créé avec succès!', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Register error:', error);
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
    const password = this.registerForm.get('password')?.value;
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
    const password = this.registerForm.get('password')?.value;
    return password && password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }
}
