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

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <div class="step-number">1</div>
            <span class="step-label">Email</span>
          </div>
          <div class="step-line" [class.completed]="currentStep > 1"></div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <div class="step-number">2</div>
            <span class="step-label">Code</span>
          </div>
          <div class="step-line" [class.completed]="currentStep > 2"></div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <div class="step-number">3</div>
            <span class="step-label">Nouveau mot de passe</span>
          </div>
        </div>

        <!-- Error Banner -->
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Step 1: Email Form -->
        <form *ngIf="currentStep === 1" [formGroup]="emailForm" (ngSubmit)="onEmailSubmit()" class="auth-form">
          <div class="form-description">
            <p>
              Entrez votre adresse email et nous vous enverrons un code de vérification à 6 chiffres.
            </p>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <mat-icon>email</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Votre adresse email"
                autocomplete="email">
              <mat-error *ngIf="emailForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="emailForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>
          </div>

          <button
            mat-raised-button
            type="submit"
            class="login-button"
            [disabled]="emailForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner" color="accent"></mat-spinner>
            <span *ngIf="!isLoading">Envoyer le code</span>
          </button>
        </form>

        <!-- Step 2: Code Verification -->
        <form *ngIf="currentStep === 2" [formGroup]="codeForm" (ngSubmit)="onCodeSubmit()" class="auth-form">
          <div class="form-description">
            <p>
              Nous avons envoyé un code à 6 chiffres à <strong>{{ userEmail }}</strong>.
              Entrez ce code pour continuer.
            </p>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock_clock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                type="text"
                formControlName="code"
                placeholder="Code à 6 chiffres"
                maxlength="6"
                autocomplete="one-time-code">
              <mat-error *ngIf="codeForm.get('code')?.hasError('required')">
                Le code est requis
              </mat-error>
              <mat-error *ngIf="codeForm.get('code')?.hasError('pattern')">
                Le code doit contenir exactement 6 chiffres
              </mat-error>
            </mat-form-field>
          </div>

          <button
            mat-raised-button
            type="submit"
            class="login-button"
            [disabled]="codeForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner" color="accent"></mat-spinner>
            <span *ngIf="!isLoading">Vérifier le code</span>
          </button>

                     <button
             mat-stroked-button
             type="button"
             (click)="resendCode()"
             [disabled]="isResending"
             class="resend-code-button">
             <mat-spinner *ngIf="isResending" diameter="16" class="spinner" color="accent"></mat-spinner>
             <span *ngIf="!isResending">Renvoyer le code</span>
           </button>
        </form>

        <!-- Step 3: New Password -->
        <form *ngIf="currentStep === 3" [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()" class="auth-form">
          <div class="form-description">
            <p>
              Code vérifié ! Entrez votre nouveau mot de passe.
            </p>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                [type]="showPassword ? 'text' : 'password'"
                formControlName="newPassword"
                placeholder="Nouveau mot de passe"
                autocomplete="new-password">
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePassword()"
                class="visibility-toggle"
                [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z"/>
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"/>
                </svg>
              </button>
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                Le nouveau mot de passe est requis
              </mat-error>
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 8 caractères
              </mat-error>
            </mat-form-field>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Confirmer le nouveau mot de passe"
                autocomplete="new-password">
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="toggleConfirmPassword()"
                class="visibility-toggle"
                [attr.aria-label]="showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                <svg *ngIf="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z"/>
                </svg>
                <svg *ngIf="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"/>
                </svg>
              </button>
              <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                La confirmation du mot de passe est requise
              </mat-error>
              <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                Les mots de passe ne correspondent pas
              </mat-error>
            </mat-form-field>
          </div>

          <button
            mat-raised-button
            type="submit"
            class="login-button"
            [disabled]="passwordForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner" color="accent"></mat-spinner>
            <span *ngIf="!isLoading">Réinitialiser le mot de passe</span>
          </button>
        </form>

        <!-- Success Message -->
        <div *ngIf="currentStep === 4" class="success-banner">
          <mat-icon>check_circle</mat-icon>
          <div class="success-content">
            <span class="success-title">Mot de passe réinitialisé avec succès !</span>
            <span class="success-message">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="auth-actions">
          <button 
            *ngIf="currentStep < 4"
            mat-button 
            routerLink="/login"
            class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Retour à la connexion
          </button>
          
          <button 
            *ngIf="currentStep === 4"
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
          <span>Le code expire dans 10 minutes</span>
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

    /* Progress Steps */
    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      gap: 0.5rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .step.active {
      opacity: 1;
    }

    .step.completed {
      opacity: 1;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #718096;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: #667eea;
      color: white;
    }

    .step.completed .step-number {
      background: #38a169;
      color: white;
    }

    .step-label {
      font-size: 12px;
      color: #718096;
      text-align: center;
      max-width: 80px;
    }

    .step.active .step-label {
      color: #667eea;
      font-weight: 600;
    }

    .step.completed .step-label {
      color: #38a169;
      font-weight: 600;
    }

    .step-line {
      width: 40px;
      height: 2px;
      background: #e2e8f0;
      transition: all 0.3s ease;
    }

    .step-line.completed {
      background: #38a169;
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

    .resend-button {
      height: 40px;
      font-size: 0.875rem;
      color: #667eea;
      border: 1px solid #667eea;
      background: transparent;
    }

    .resend-button:hover:not(:disabled) {
      background: #667eea;
      color: white;
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

      .progress-steps {
        gap: 0.25rem;
      }

      .step-line {
        width: 20px;
      }

      .step-label {
        font-size: 10px;
        max-width: 60px;
      }
    }

    /* Input Groups and Form Fields - Same style as authentication forms */
    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 16px;
      z-index: 10;
      color: #FFFFFF;
      display: flex;
      align-items: center;
    }

    .input-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid #000000;
      overflow: hidden;
      padding-left: 48px;
    }

    .form-field ::ng-deep .mat-mdc-form-field-infix {
      padding: 8px 0;
      min-height: unset;
    }

    .form-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .form-field ::ng-deep .mat-mdc-form-field-label {
      color: #4a5568;
      font-size: 12px;
      font-weight: 500;
      transition: color 0.3s ease;
      margin-left: -48px;
    }

    .form-field ::ng-deep input {
      color: #000000 !important;
      font-size: 14px;
      font-weight: 500;
      padding: 4px 0;
      background: transparent !important;
      border: none;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .form-field ::ng-deep input::placeholder {
      color: #666666 !important;
      opacity: 1;
      font-size: 14px;
      font-weight: 400;
    }

    /* Force transparent background for autocomplete */
    .form-field ::ng-deep input:-webkit-autofill,
    .form-field ::ng-deep input:-webkit-autofill:hover,
    .form-field ::ng-deep input:-webkit-autofill:focus,
    .form-field ::ng-deep input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px transparent inset !important;
      -webkit-text-fill-color: #2d3748 !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Override browser autocomplete styles */
    .form-field ::ng-deep input[autocomplete] {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Focus States */
    .form-field:focus-within ::ng-deep .mat-mdc-text-field-wrapper {
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      border: 2px solid #667eea;
      transform: translateY(-2px);
    }

    .form-field:focus-within ::ng-deep .mat-mdc-form-field-label {
      color: #667eea;
    }

    /* Hover States */
    .form-field:hover ::ng-deep .mat-mdc-text-field-wrapper {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    /* Buttons - Same style as authentication forms */
    .login-button {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .create-account-button {
      width: 100%;
      height: 48px;
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .create-account-button:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .create-account-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Visibility toggle button */
    .visibility-toggle {
      color: #a0aec0;
      transition: color 0.3s ease;
    }

    .visibility-toggle:hover {
      color: #667eea;
    }

    .custom-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    /* Spinner */
    .spinner {
      margin-right: 0.5rem;
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

      .input-group {
        background: rgba(45, 55, 72, 0.5);
        border-color: #4a5568;
      }

      .input-group:focus-within {
        background: rgba(45, 55, 72, 0.8);
        border-color: #667eea;
      }

      .form-field input {
        color: white;
      }

      .form-field input::placeholder {
        color: #a0aec0;
      }
    }

    /* Resend Code Button - Always visible */
    .resend-code-button {
      width: 100%;
      height: 48px;
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .resend-code-button:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .resend-code-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      border-color: #a0aec0;
      color: #a0aec0;
    }

    .resend-code-button .spinner {
      margin-right: 0.5rem;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  emailForm: FormGroup;
  codeForm: FormGroup;
  passwordForm: FormGroup;
  
  currentStep = 1;
  userEmail = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isResending = false;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      code: ['', [
        Validators.required, 
        Validators.pattern(/^\d{6}$/)
      ]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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

  onEmailSubmit(): void {
    if (this.emailForm.valid && !this.isLoading) {
      const email = this.emailForm.value.email;
      this.userEmail = email;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.snackBar.open('Code envoyé par email!', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.currentStep = 2;
          this.errorMessage = '';
        },
        error: (error: any) => {
          console.error('Forgot password error:', error);
          let errorMessage = 'Erreur lors de l\'envoi du code';
          
          if (error.status === 404) {
            errorMessage = 'Email non trouvé dans notre système';
          } else if (error.status === 429) {
            errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          }
          
          this.errorMessage = errorMessage;
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  onCodeSubmit(): void {
    if (this.codeForm.valid && !this.isLoading) {
      // For now, we'll just move to the next step
      // In a real implementation, you might want to validate the code first
      this.currentStep = 3;
      this.errorMessage = '';
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid && !this.isLoading) {
      const { newPassword } = this.passwordForm.value;
      const code = this.codeForm.value.code;

      // Call the backend to reset password with code
      this.authService.resetPasswordWithCode(this.userEmail, code, newPassword).subscribe({
        next: () => {
          this.snackBar.open('Mot de passe réinitialisé avec succès!', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.currentStep = 4;
          this.errorMessage = '';
        },
        error: (error: any) => {
          console.error('Reset password error:', error);
          let errorMessage = 'Erreur lors de la réinitialisation';
          
          if (error.status === 400) {
            errorMessage = 'Code invalide ou expiré';
          } else if (error.status === 404) {
            errorMessage = 'Email non trouvé';
          }
          
          this.errorMessage = errorMessage;
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  resendCode(): void {
    if (!this.isResending) {
      this.isResending = true;
      
      this.authService.forgotPassword(this.userEmail).subscribe({
        next: () => {
          this.isResending = false;
          this.snackBar.open('Nouveau code envoyé!', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error: any) => {
          this.isResending = false;
          console.error('Resend code error:', error);
          this.snackBar.open('Erreur lors de l\'envoi du code', 'Fermer', {
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

  // Password match validator
  private passwordMatchValidator(group: any): {[key: string]: any} | null {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
