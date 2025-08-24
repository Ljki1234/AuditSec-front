import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  AuthResponse,
  ResetTokenValidation,
  User,
  AuthState,
  UserRole
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }

  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/login`, credentials).pipe(
      tap(response => {
        this.handleSuccessfulAuth(response);
      }),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  // Register
  register(userData: RegisterRequest): Observable<any> {
    this.setLoading(true);
    
    return this.http.post<any>(`${this.API_BASE_URL}/register`, userData).pipe(
      tap(response => {
        this.setLoading(false);
        this.clearError();
      }),
      catchError(error => {
        this.setLoading(false);
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  // Forgot Password
  forgotPassword(email: string): Observable<any> {
    this.setLoading(true);
    
    return this.http.post(`${this.API_BASE_URL}/forgot-password`, { email }).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Reset Password
  resetPassword(token: string, newPassword: string): Observable<any> {
    this.setLoading(true);
    
    return this.http.post(`${this.API_BASE_URL}/reset-password`, { token, newPassword }).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Validate Reset Token
  validateResetToken(token: string): Observable<ResetTokenValidation> {
    return this.http.get<ResetTokenValidation>(`${this.API_BASE_URL}/reset-password/validate`, {
      params: { token }
    }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  // Test Auth (Protected Route)
  testAuth(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/test-auth`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  // Logout
  logout(): void {
    this.clearStoredAuth();
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  // Check if user has specific role
  hasRole(role: UserRole): boolean {
    const currentState = this.authStateSubject.value;
    return currentState.user?.roles.includes(role) || false;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // Private helper methods
  private handleSuccessfulAuth(response: AuthResponse): void {
    const { token, user, remainingAttempts, lockoutEndTime } = response;
    
    this.storeAuth(token, user);
    
    this.authStateSubject.next({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      remainingAttempts,
      lockoutEndTime
    });
  }

  private handleAuthError(error: HttpErrorResponse): void {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Identifiants invalides';
    } else if (error.status === 403) {
      errorMessage = 'Compte temporairement verrouillé';
    } else if (error.status === 429) {
      errorMessage = 'Trop de tentatives échouées';
    }

    this.authStateSubject.next({
      ...this.authStateSubject.value,
      error: errorMessage,
      isLoading: false
    });
  }

  private setLoading(isLoading: boolean): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading,
      error: null
    });
  }

  private clearError(): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      error: null
    });
  }

  private storeAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
