export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    email: string;
    username: string;
    roles: string[];
  };
  remainingAttempts?: number;
  lockoutEndTime?: string;
}

export interface ResetTokenValidation {
  valid: boolean;
  message: string;
}

export interface User {
  email: string;
  username: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  remainingAttempts?: number;
  lockoutEndTime?: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
