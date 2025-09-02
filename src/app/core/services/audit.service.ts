import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AuditRequest {
  url: string;
  options: {
    includeVulnerabilities: boolean;
    includeSEO: boolean;
    includePerformance: boolean;
    depth: 'quick' | 'standard' | 'deep';
  };
}

export interface AuditResult {
  id: string;
  url: string;
  timestamp: Date;
  overallScore: number;
  status: 'good' | 'warning' | 'critical';
  categories: AuditCategory[];
  vulnerabilities: Vulnerability[];
  trends: TrendData[];
  scanDuration: number;
  scanType: string;
}

export interface AuditCategory {
  name: string;
  icon: string;
  score: number;
  status: 'good' | 'warning' | 'critical';
  details: CategoryDetail[];
  summary: string;
}

export interface CategoryDetail {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  recommendation?: string;
  impact?: 'low' | 'medium' | 'high';
}

export interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  cve?: string;
  remediation?: string;
  riskScore?: number;
}

export interface TrendData {
  date: Date;
  score: number;
}

export interface AuditHistory {
  audits: AuditResult[];
  totalCount: number;
  averageScore: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly API_BASE_URL = '/api/audits';

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
   * Lance un nouvel audit
   */
  runAudit(request: AuditRequest): Observable<AuditResult> {
    return this.http.post<{success: boolean, data: AuditResult, message: string}>(
      `${this.API_BASE_URL}/run`,
      request,
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
        console.error('Erreur lors du lancement de l\'audit:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère l'historique des audits
   */
  getAuditHistory(page: number = 1, limit: number = 10): Observable<AuditHistory> {
    return this.http.get<{success: boolean, data: AuditHistory, message: string}>(
      `${this.API_BASE_URL}/history?page=${page}&limit=${limit}`,
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
        console.error('Erreur lors de la récupération de l\'historique:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un audit spécifique par ID
   */
  getAuditById(auditId: string): Observable<AuditResult> {
    return this.http.get<{success: boolean, data: AuditResult, message: string}>(
      `${this.API_BASE_URL}/${auditId}`,
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
        console.error(`Erreur lors de la récupération de l'audit ${auditId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Télécharge le rapport PDF d'un audit
   */
  downloadPDF(auditId: string): Observable<Blob> {
    return this.http.get(
      `${this.API_BASE_URL}/${auditId}/pdf`,
      { 
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors du téléchargement du PDF:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Télécharge les données CSV d'un audit
   */
  downloadCSV(auditId: string): Observable<Blob> {
    return this.http.get(
      `${this.API_BASE_URL}/${auditId}/csv`,
      { 
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors du téléchargement du CSV:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Partage les résultats d'un audit par email
   */
  shareResults(auditId: string, email: string): Observable<any> {
    return this.http.post<{success: boolean, message: string}>(
      `${this.API_BASE_URL}/${auditId}/share`,
      { email },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Erreur lors du partage des résultats:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime un audit
   */
  deleteAudit(auditId: string): Observable<any> {
    return this.http.delete<{success: boolean, message: string}>(
      `${this.API_BASE_URL}/${auditId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression de l'audit ${auditId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statistiques des audits
   */
  getAuditStatistics(): Observable<any> {
    return this.http.get<{success: boolean, data: any, message: string}>(
      `${this.API_BASE_URL}/statistics`,
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
        console.error('Erreur lors de la récupération des statistiques:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Planifie un audit récurrent
   */
  scheduleRecurringAudit(request: any): Observable<any> {
    return this.http.post<{success: boolean, data: any, message: string}>(
      `${this.API_BASE_URL}/schedule`,
      request,
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
        console.error('Erreur lors de la planification de l\'audit:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Simule un audit pour les tests (mock data)
   */
  simulateAudit(url: string, options: any): Observable<AuditResult> {
    // Simulation d'un audit avec des données mock
    return timer(3000).pipe(
      switchMap(() => {
        const mockResult: AuditResult = {
          id: `audit-${Date.now()}`,
          url: url,
          timestamp: new Date(),
          overallScore: Math.floor(Math.random() * 40) + 60, // Score entre 60-100
          status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'good',
          scanDuration: Math.floor(Math.random() * 30) + 10,
          scanType: options.depth,
          categories: [
            {
              name: 'SSL Security',
              icon: '🔒',
              score: Math.floor(Math.random() * 30) + 70,
              status: 'good',
              summary: 'SSL certificate is valid and properly configured',
              details: [
                { name: 'Certificate Validity', status: 'pass', description: 'Certificate is valid until 2024-12-31' },
                { name: 'TLS Version', status: 'pass', description: 'TLS 1.3 is supported' },
                { name: 'Cipher Strength', status: 'warning', description: 'Some weak ciphers are still supported' }
              ]
            },
            {
              name: 'HTTP Headers',
              icon: '🛡️',
              score: Math.floor(Math.random() * 40) + 50,
              status: 'warning',
              summary: 'Some security headers are missing',
              details: [
                { name: 'X-Frame-Options', status: 'pass', description: 'Header is properly set' },
                { name: 'Content-Security-Policy', status: 'fail', description: 'CSP header is missing', recommendation: 'Add CSP header to prevent XSS attacks' },
                { name: 'X-Content-Type-Options', status: 'pass', description: 'Header is properly set' }
              ]
            },
            {
              name: 'JavaScript Libraries',
              icon: '📦',
              score: Math.floor(Math.random() * 50) + 30,
              status: 'critical',
              summary: 'Outdated libraries with known vulnerabilities detected',
              details: [
                { name: 'jQuery Version', status: 'fail', description: 'jQuery 1.12.4 has known vulnerabilities', recommendation: 'Update to jQuery 3.6.0 or later' },
                { name: 'Bootstrap Version', status: 'warning', description: 'Bootstrap 4.6.0 has some known issues' }
              ]
            },
            {
              name: 'Web Vulnerabilities',
              icon: '⚠️',
              score: Math.floor(Math.random() * 30) + 70,
              status: 'good',
              summary: 'No critical vulnerabilities detected',
              details: [
                { name: 'XSS Protection', status: 'pass', description: 'No XSS vulnerabilities found' },
                { name: 'SQL Injection', status: 'pass', description: 'No SQL injection vulnerabilities found' },
                { name: 'CSRF Protection', status: 'warning', description: 'CSRF token implementation could be improved' }
              ]
            },
            {
              name: 'Cookies & Sessions',
              icon: '🍪',
              score: Math.floor(Math.random() * 40) + 50,
              status: 'warning',
              summary: 'Some cookie security flags are missing',
              details: [
                { name: 'HttpOnly Flag', status: 'pass', description: 'HttpOnly flag is set on sensitive cookies' },
                { name: 'Secure Flag', status: 'fail', description: 'Secure flag is missing on some cookies', recommendation: 'Add Secure flag to all cookies' },
                { name: 'SameSite Attribute', status: 'warning', description: 'SameSite attribute could be stricter' }
              ]
            },
            {
              name: 'SEO Audit',
              icon: '🔍',
              score: Math.floor(Math.random() * 30) + 70,
              status: 'good',
              summary: 'Good SEO practices implemented',
              details: [
                { name: 'Meta Tags', status: 'pass', description: 'All essential meta tags are present' },
                { name: 'Heading Structure', status: 'pass', description: 'Proper H1-H6 hierarchy' },
                { name: 'Page Speed', status: 'warning', description: 'Page load time could be optimized' }
              ]
            }
          ],
          vulnerabilities: [
            {
              type: 'Outdated Library',
              severity: 'high',
              description: 'jQuery 1.12.4 has known XSS vulnerabilities',
              location: `${url}/js/jquery.min.js`,
              cve: 'CVE-2020-11022',
              remediation: 'Update to jQuery 3.6.0 or later',
              riskScore: 8.5
            },
            {
              type: 'Missing Security Header',
              severity: 'medium',
              description: 'Content-Security-Policy header is missing',
              location: 'All pages',
              remediation: 'Add CSP header to prevent XSS attacks',
              riskScore: 6.0
            }
          ],
          trends: [
            { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), score: 75 },
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 78 },
            { date: new Date(), score: 82 }
          ]
        };
        return of(mockResult);
      })
    );
  }
}

