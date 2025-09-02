import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AuditsCountData {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  failedAudits: number;
  completionRate: number;
}

export interface WebsitesCountData {
  totalWebsites: number;
  activeWebsites: number;
  inactiveWebsites: number;
  activeRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsiteService {
  private readonly API_BASE_URL = '/api/websites';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getCurrentToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Récupère le nombre d'audits de l'utilisateur connecté
   */
  getAuditsCount(): Observable<AuditsCountData> {
    return this.http.get<{success: boolean, data: AuditsCountData, message: string}>(
      `${this.API_BASE_URL}/audits-count`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération du nombre d\'audits:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère le nombre de sites surveillés de l'utilisateur connecté
   */
  getWebsitesCount(): Observable<WebsitesCountData> {
    return this.http.get<{success: boolean, data: WebsitesCountData, message: string}>(
      `${this.API_BASE_URL}/websites-count`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération du nombre de sites:', error);
        return throwError(() => error);
      })
    );
  }
}
