import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
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
    MatCardModule
  ],
  template: `
    <div class="auth-container">
      <!-- Background Animation -->
      <div class="background-animation">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>

      <!-- Main Login Card -->
      <div class="login-card">
        <!-- Header -->
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-icon">🔐</div>
            <h1 class="brand-title">AuditSec</h1>
          </div>
          <p class="welcome-text">{{ showRegisterForm ? 'Créez votre compte' : 'Bienvenue ! Connectez-vous à votre compte' }}</p>
        </div>

        <!-- Login Form -->
        <form *ngIf="!showRegisterForm" [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
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
                autocomplete="off">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Password Field -->
          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Votre mot de passe"
                autocomplete="off">
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
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <mat-checkbox formControlName="rememberMe" class="remember-checkbox">
              Se souvenir de moi
            </mat-checkbox>
            <a routerLink="/forgot-password" class="forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          <!-- Login Button -->
          <button
            mat-raised-button
            type="submit"
            class="login-button"
            [disabled]="loginForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
            <span *ngIf="!isLoading">Se connecter</span>
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="showRegisterForm" [formGroup]="registerForm" (ngSubmit)="onRegisterSubmit()" class="login-form">
          <!-- Username Field -->
          <div class="input-group">
            <div class="input-icon">
              <mat-icon>person</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                type="text"
                formControlName="username"
                placeholder="Nom d'utilisateur"
                autocomplete="off">
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                Le nom d'utilisateur est requis
              </mat-error>
              <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
                Le nom d'utilisateur doit contenir au moins 3 caractères
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Email Field -->
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
                autocomplete="off">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Password Field -->
          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                [type]="showRegisterPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Mot de passe (min. 16 caractères)"
                autocomplete="off">
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="toggleRegisterPassword()"
                class="visibility-toggle"
                [attr.aria-label]="showRegisterPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                <svg *ngIf="!showRegisterPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z"/>
                </svg>
                <svg *ngIf="showRegisterPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="custom-icon">
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"/>
                </svg>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 16 caractères
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Confirm Password Field -->
          <div class="input-group">
            <div class="input-icon">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="form-field">
              <input
                matInput
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Confirmer le mot de passe"
                autocomplete="off">
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
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                La confirmation du mot de passe est requise
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Password Mismatch Error -->
          <div *ngIf="registerForm.hasError('passwordMismatch')" class="error-message">
            <mat-icon>error</mat-icon>
            <span>Les mots de passe ne correspondent pas</span>
          </div>

          <!-- Register Button -->
          <button
            mat-raised-button
            type="submit"
            class="login-button"
            [disabled]="registerForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
            <span *ngIf="!isLoading">S'inscrire</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span></span>
        </div>

        <!-- Toggle Button -->
        <button
          mat-stroked-button
          type="button"
          class="create-account-button"
          (click)="toggleRegisterForm()">
          {{ showRegisterForm ? 'Déjà un compte ? Se connecter' : 'Créer un nouveau compte' }}
        </button>

        <!-- Error Messages -->
        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Lockout Warning -->
        <div *ngIf="lockoutEndTime" class="lockout-message">
          <mat-icon>lock</mat-icon>
          <span>Compte temporairement verrouillé - Déverrouillage: {{ getLockoutTime() }}</span>
        </div>

        <!-- Remaining Attempts -->
        <div *ngIf="remainingAttempts !== undefined && remainingAttempts < 5" class="attempts-message">
          <mat-icon>warning</mat-icon>
          <span>Tentatives restantes: {{ remainingAttempts }}</span>
        </div>

        <!-- Password Strength Indicator -->
        <div *ngIf="registerForm.get('password')?.value" class="password-strength">
          Force du mot de passe:
          <span [ngClass]="{'weak': isPasswordWeak(), 'medium': isPasswordMedium(), 'strong': isPasswordStrong()}">
            {{ getPasswordStrength() }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    /* Background Animation */
    .background-animation {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .floating-shapes {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 80px;
      height: 80px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 60px;
      height: 60px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    .shape-4 {
      width: 100px;
      height: 100px;
      top: 30%;
      right: 30%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    /* Main Login Card */
    .login-card {
      width: 100%;
      max-width: 380px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      padding: 2rem 2rem;
      color: #2d3748;
      position: relative;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Card Header */
    .card-header {
      text-align: center;
      margin-bottom: 1.5rem;
      background: transparent;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      background: transparent;
    }

    .logo-icon {
      font-size: 2rem;
      margin-right: 0.5rem;
      animation: pulse 2s infinite;
      background: transparent;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .brand-title {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      background-color: transparent;
    }

    .welcome-text {
      font-size: 1rem;
      color: #718096;
      margin: 0;
      font-weight: 400;
      background: transparent;
    }

    /* Form Styling */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

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
      color: #2d3748;
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
      color: #a0aec0;
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

    /* Visibility Toggle Button */
    .visibility-toggle {
      color: #a0aec0;
      transition: all 0.2s ease;
    }

    .visibility-toggle:hover {
      color: #667eea;
      background-color: rgba(102, 126, 234, 0.1);
    }

    .visibility-toggle .mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .visibility-toggle .custom-icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    /* Form Options */
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0.25rem 0;
    }

    .remember-checkbox {
      color: #4a5568;
      font-size: 13px;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .forgot-link:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    /* Buttons */
    .login-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      margin-top: 0.75rem;
      text-transform: none;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
    }

    .login-button:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      margin-right: 0.5rem;
    }

    /* Create Account Button */
    .create-account-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 14px;
      color: #667eea;
      border: 2px solid #667eea;
      text-transform: none;
      transition: all 0.3s ease;
      background: transparent;
      width: 100%;
      margin-top: 0.75rem; /* Adjusted margin for optimal spacing with divider */
    }

    .create-account-button:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    /* Error Messages */
    .error-message, .lockout-message, .attempts-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 10px;
      margin-top: 1rem;
      font-size: 13px;
      font-weight: 500;
    }

    .error-message {
      background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
      color: #c53030;
      border: 1px solid #feb2b2;
    }

    .lockout-message {
      background: linear-gradient(135deg, #fef5e7 0%, #fbd38d 100%);
      color: #d69e2e;
      border: 1px solid #fbd38d;
    }

    .attempts-message {
      background: linear-gradient(135deg, #fef5e7 0%, #fbd38d 100%);
      color: #d69e2e;
      border: 1px solid #fbd38d;
    }

    .error-message mat-icon, .lockout-message mat-icon, .attempts-message mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Password Strength Indicator */
    .password-strength {
      margin-top: 0.5rem;
      font-size: 12px;
      color: #718096;
    }

    .password-strength.weak {
      color: #e53e3e;
    }

    .password-strength.medium {
      color: #d69e2e;
    }

    .password-strength.strong {
      color: #38a169;
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
      color: #a0aec0;
      font-size: 13px;
      font-weight: 500;
    }

    .divider span {
      flex-grow: 1;
      height: 1px;
      background-color: #e2e8f0;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem 1.25rem;
        margin: 0.5rem;
      }

      .brand-title {
        font-size: 1.5rem;
      }

      .welcome-text {
        font-size: 0.9rem;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .login-card {
        background: rgba(26, 32, 44, 0.95);
        color: #e2e8f0;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper {
        background: rgba(45, 55, 72, 0.8);
      }

      .form-field ::ng-deep input {
        color: #e2e8f0;
      }

      .form-field ::ng-deep input::placeholder {
        color: #a0aec0;
      }

      .brand-title {
        background: linear-gradient(135deg, #a0aec0 0%, #e2e8f0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-text {
        color: #a0aec0;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  registerForm: FormGroup;
  showPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  remainingAttempts?: number;
  lockoutEndTime?: string;
  showRegisterForm = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(16)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Reset form to ensure empty fields on page reload
    this.resetForm();
    
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
        this.errorMessage = state.error || '';
        this.remainingAttempts = state.remainingAttempts;
        this.lockoutEndTime = state.lockoutEndTime;

        if (state.isAuthenticated) {
          this.router.navigate(['/tableau-de-bord']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetForm(): void {
    this.loginForm.reset({
      email: '',
      password: '',
      rememberMe: false
    });
    this.showPassword = false;
    this.errorMessage = '';
  }

  resetRegisterForm(): void {
    this.registerForm.reset({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    this.showRegisterPassword = false;
    this.showConfirmPassword = false;
    this.errorMessage = '';
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'passwordMismatch': true };
  }

  toggleRegisterForm(): void {
    this.showRegisterForm = !this.showRegisterForm;
    if (this.showRegisterForm) {
      this.resetRegisterForm();
    } else {
      this.resetForm();
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      const userData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          // Registration successful
          console.log('Registration successful:', response);
          this.snackBar.open('Inscription réussie!', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.showRegisterForm = false;
          this.resetForm();
          this.errorMessage = ''; // Clear any error messages
        },
        error: (error) => {
          // Ignore 200 responses that are treated as errors
          if (error.status === 200) {
            console.log('Registration successful (treated as error):', error);
            this.snackBar.open('Inscription réussie!', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.showRegisterForm = false;
            this.resetForm();
            this.errorMessage = '';
          } else {
            console.error('Register error:', error);
            this.errorMessage = error.error || 'Erreur lors de l\'inscription';
          }
        }
      });
    }
  }

  toggleRegisterPassword(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.snackBar.open('Connexion réussie!', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Login error:', error);
        }
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getLockoutTime(): string {
    if (!this.lockoutEndTime) return '';

    const lockoutDate = new Date(this.lockoutEndTime);
    const now = new Date();
    const diffMs = lockoutDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Maintenant';

    const diffMins = Math.ceil(diffMs / (1000 * 60));
    return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  }

  isPasswordWeak(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password);
  }

  isPasswordMedium(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password.length >= 8 && (/[a-z]/.test(password) || /[A-Z]/.test(password) || /[0-9]/.test(password)) && password.length < 16;
  }

  isPasswordStrong(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password.length >= 16 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }

  getPasswordStrength(): string {
    if (!this.registerForm.get('password')?.value) {
      return 'Aucun mot de passe';
    }
    if (this.isPasswordWeak()) {
      return 'Faible';
    }
    if (this.isPasswordMedium()) {
      return 'Moyen';
    }
    if (this.isPasswordStrong()) {
      return 'Fort';
    }
    return 'Aucun mot de passe';
  }
}
