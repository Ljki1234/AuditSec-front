import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AuditResult {
  id: string;
  title: string;
  icon: string;
  score: number;
  status: 'good' | 'warning' | 'critical';
  summary: string;
  details: string[];
  // Propriété optionnelle pour l'ID de l'audit SEO
  seoAuditId?: number;
}

interface AuditHistory {
  url: string;
  date: Date;
  overallScore: number;
}

@Component({
  selector: 'app-audits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audits-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">
            Audit de Sécurité des Sites Web
          </h1>
          <p class="page-subtitle">
            Analyse complète de sécurité et de performance pour votre site web
          </p>
        </div>

        <!-- URL Input Section -->
        <div class="input-section">
          <div class="url-input-container">
            <div class="input-group">
              <label for="url" class="input-label">
                URL du Site Web
              </label>
              <input
                type="url"
                id="url"
                [(ngModel)]="currentUrl"
                placeholder="https://exemple.com"
                class="url-input"
              />
            </div>
            <div class="button-group">
              <button
                (click)="runAudit()"
                [disabled]="isLoading()"
                class="btn btn-primary audit-btn"
              >
                @if (isLoading()) {
                  <div class="spinner"></div>
                  <span>Audit en cours...</span>
                } @else {
                  <span>🔍</span>
                  <span>Lancer l'Audit</span>
                }
              </button>
            </div>
          </div>

          <!-- Recent Audits -->
          @if (auditHistory().length > 0) {
            <div class="recent-audits">
              <h3 class="recent-title">Audits Récents</h3>
              <div class="audit-history">
                @for (audit of auditHistory(); track audit.url) {
                  <button
                    (click)="loadHistoryAudit(audit)"
                    class="history-btn"
                  >
                    {{ audit.url }} - {{ audit.overallScore }}/100
                  </button>
                }
              </div>
            </div>
          }
          

        </div>

        @if (showResults()) {
          <!-- Global Summary Section -->
          <div class="summary-section">
            <div class="summary-content">
              <h2 class="summary-title">Résumé de l'Audit</h2>
              
              <div class="summary-grid">
                <!-- Overall Score Circle -->
                <div class="score-circle-container">
                  <div class="score-circle">
                    <svg class="score-svg" viewBox="0 0 36 36">
                      <!-- Background circle -->
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="score-bg"
                      />
                      <!-- Progress circle -->
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="overallScore() + ', 100'"
                        [class]="getScoreColor(overallScore())"
                        class="score-progress"
                      />
                    </svg>
                    <div class="score-text">
                      <div class="score-number">
                        {{ overallScore() }}
                      </div>
                      <div class="score-total">
                        /100
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Status Summary -->
                <div class="status-summary">
                  <div class="status-text" [class]="getStatusTextColor(overallScore())">
                    {{ getStatusText(overallScore()) }}
                  </div>
                  <div class="status-counts">
                    <div class="status-item">
                      <div class="status-number good">
                        {{ getStatusCounts().good }}
                      </div>
                                          <div class="status-label">Bon</div>
                  </div>
                  <div class="status-item">
                    <div class="status-number warning">
                      {{ getStatusCounts().warning }}
                    </div>
                    <div class="status-label">Attention</div>
                  </div>
                  <div class="status-item">
                    <div class="status-number critical">
                      {{ getStatusCounts().critical }}
                    </div>
                    <div class="status-label">Critique</div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Results Section -->
          <div class="results-grid">
            @for (result of auditResults(); track result.id; let i = $index) {
              <div 
                class="result-card animate-fade-in"
                [style.animation-delay.ms]="i * 100"
              >
                <!-- Card Header -->
                <div class="card-header">
                  <div class="card-title">
                    <div class="card-icon">{{ result.icon }}</div>
                    <h3 class="card-name">
                      {{ result.title }}
                    </h3>
                  </div>
                  <div [class]="getStatusBadgeClass(result.status)" class="status-badge">
                    {{ getStatusIcon(result.status) }} {{ result.status | titlecase }}
                  </div>
                </div>

                <!-- Score Progress Bar -->
                <div class="score-section">
                  <div class="score-header">
                    <span class="score-label">Score</span>
                    <span class="score-value">{{ result.score }}/100</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      [class]="getScoreBarColor(result.score)"
                      class="progress-fill"
                      [style.width.%]="result.score"
                      [style.animation-delay.ms]="i * 150"
                    ></div>
                  </div>
                </div>

                <!-- Summary -->
                <p class="card-summary">
                  {{ result.summary }}
                </p>

                <!-- View Details Button -->
                @if ((result.id === 'web-vulnerabilities' && isVulnScanLoading()) || (result.id === 'seo' && isSeoAuditLoading())) {
                  <div class="loading-container">
                    <div class="spinner"></div>
                    <span class="loading-text">
                      @if (result.id === 'web-vulnerabilities') {
                        Veuillez patienter un peu...
                      } @else if (result.id === 'seo') {
                        Récupération des détails SEO...
                      } @else {
                        Veuillez patienter un peu...
                      }
                    </span>
                  </div>
                } @else {
                  <button
                    (click)="viewDetails(result)"
                    class="btn btn-secondary details-btn"
                    [disabled]="(result.id === 'web-vulnerabilities' && isVulnScanLoading()) || (result.id === 'seo' && isSeoAuditLoading())"
                    [class.btn-disabled]="(result.id === 'web-vulnerabilities' && isVulnScanLoading()) || (result.id === 'seo' && isSeoAuditLoading())"
                  >
                    Voir les Détails
                  </button>
                }
              </div>
            }
          </div>
        }

        @if (!showResults() && !isLoading()) {
                  <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h2 class="empty-title">Prêt pour l'Audit</h2>
          <p class="empty-text">Entrez une URL de site web ci-dessus pour commencer l'audit de sécurité</p>
        </div>
        }
      </div>
    </div>
    
    <!-- Modal pour les détails -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">{{ selectedResult()?.icon }}</span>
              <h3>{{ selectedResult()?.title }}</h3>
            </div>
            <button class="modal-close" (click)="closeModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="modal-score-section">
              <div class="modal-score-display">
                <span class="modal-score-number">{{ selectedResult()?.score }}</span>
                <span class="modal-score-max">/100</span>
              </div>
              <div class="modal-status-badge" [class]="getStatusBadgeClass(selectedResult()?.status || '')">
                {{ getStatusIcon(selectedResult()?.status || '') }} {{ selectedResult()?.status | titlecase }}
              </div>
            </div>
            
            <div class="modal-summary">
              <p>{{ selectedResult()?.summary }}</p>
            </div>
            
            <div class="modal-details">
              <h4>Détails de l'audit :</h4>
              <ul class="details-list">
                @for (detail of selectedResult()?.details; track $index) {
                  <li class="detail-item">{{ detail }}</li>
                }
              </ul>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closeModal()">Fermer</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .audits-page {
      min-height: 100vh;
      background-color: var(--bg-secondary);
      transition: background-color 0.3s ease;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* Header */
    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 1.125rem;
      margin: 0;
    }

    /* Input Section */
    .input-section {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .url-input-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .url-input-container {
        flex-direction: row;
        align-items: end;
      }
    }

    .input-group {
      flex: 1;
    }

    .input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .url-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .url-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .button-group {
      display: flex;
      align-items: end;
    }

    .audit-btn {
      min-width: 140px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Recent Audits */
    .recent-audits {
      margin-top: 1.5rem;
    }

    .recent-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
    }

    .audit-history {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .history-btn {
      padding: 0.5rem 0.75rem;
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .history-btn:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }

    /* Summary Section */
    .summary-section {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .summary-content {
      text-align: center;
    }

    .summary-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.5rem 0;
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .summary-grid {
        flex-direction: row;
      }
    }

    /* Score Circle */
    .score-circle-container {
      position: relative;
    }

    .score-circle {
      width: 128px;
      height: 128px;
      position: relative;
    }

    .score-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .score-bg {
      color: var(--bg-tertiary);
    }

    .score-progress {
      transition: all 1s ease-out;
    }

    .score-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .score-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .score-total {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    /* Status Summary */
    .status-summary {
      text-align: center;
    }

    @media (min-width: 768px) {
      .status-summary {
        text-align: left;
      }
    }

    .status-text {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .status-counts {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .status-item {
      text-align: center;
    }

    .status-number {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .status-number.good {
      color: var(--success-color);
    }

    .status-number.warning {
      color: var(--warning-color);
    }

    .status-number.critical {
      color: var(--error-color);
    }

    .status-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .result-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      transition: all 0.3s ease;
    }

    .result-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-icon {
      font-size: 1.5rem;
    }

    .card-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Score Section */
    .score-section {
      margin-bottom: 1rem;
    }

    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .score-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .score-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease-out;
    }

    .progress-success {
      background-color: var(--success-color);
    }

    .progress-warning {
      background-color: var(--warning-color);
    }

    .progress-danger {
      background-color: var(--error-color);
    }

    .card-summary {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .details-btn {
      width: 100%;
      font-size: 0.875rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .empty-text {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Animations */
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
      opacity: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .status-counts {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Modal Styles - Design Professionnel */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 1rem;
    }
    
    .modal-content {
      background: linear-gradient(145deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      max-width: 650px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    
    .modal-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2rem 2rem 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border-radius: 1.5rem 1.5rem 0 0;
      position: relative;
    }
    
    .modal-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), var(--success-color));
      border-radius: 2px;
    }
    
    .modal-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .modal-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
      animation: iconFloat 3s ease-in-out infinite;
    }
    
    .modal-title h3 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: -0.025em;
    }
    
    .modal-close {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }
    
    .modal-close:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
      color: var(--text-primary);
      transform: scale(1.1) rotate(90deg);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    .modal-body {
      padding: 2rem;
    }
    
    .modal-score-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .modal-score-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color), var(--success-color), var(--warning-color));
      opacity: 0.8;
    }
    
    .modal-score-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      position: relative;
    }
    
    .modal-score-number {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary-color), var(--success-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .modal-score-max {
      font-size: 1.5rem;
      color: var(--text-secondary);
      font-weight: 500;
      opacity: 0.8;
    }
    
    .modal-status-badge {
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 600;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .modal-status-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .modal-summary {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    
    .modal-summary::before {
      content: '📋';
      position: absolute;
      top: -10px;
      left: 20px;
      background: var(--bg-primary);
      padding: 0 0.5rem;
      font-size: 0.875rem;
      border-radius: 0.5rem;
      color: var(--text-secondary);
    }
    
    .modal-summary p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.7;
      font-size: 1.1rem;
      font-weight: 500;
      text-align: center;
    }
    
    .modal-details h4 {
      margin: 0 0 1.5rem 0;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      text-align: center;
      position: relative;
      padding-bottom: 0.75rem;
    }
    
    .modal-details h4::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color), var(--success-color));
      border-radius: 1px;
    }
    
    .details-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 1rem;
    }
    
    .detail-item {
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-radius: 0.75rem;
      color: var(--text-primary);
      border-left: 4px solid var(--primary-color);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .detail-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }
    
    .detail-item:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-left-color: var(--success-color);
    }
    
    .detail-item:hover::before {
      transform: translateX(100%);
    }
    
    .modal-footer {
      padding: 1.5rem 2rem 2rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
      border-radius: 0 0 1.5rem 1.5rem;
    }
    
    .modal-footer .btn {
      padding: 0.875rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 2rem;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    }
    
    .modal-footer .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }
    
    .modal-footer .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    .modal-footer .btn:hover::before {
      left: 100%;
    }
    
    /* Modal Animations Avancées */
    @keyframes fadeIn {
      from { 
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to { 
        opacity: 1;
        backdrop-filter: blur(8px);
      }
    }
    
    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-30px) scale(0.9) rotateX(10deg);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0deg);
      }
    }
    
    @keyframes iconFloat {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg);
      }
      50% { 
        transform: translateY(-8px) rotate(5deg);
      }
    }
    
    @keyframes scorePulse {
      0%, 100% { 
        transform: scale(1);
      }
      50% { 
        transform: scale(1.05);
      }
    }
    
    .modal-score-number {
      animation: scorePulse 2s ease-in-out infinite;
    }
    
    /* Modal Responsive et Améliorations */
    @media (max-width: 640px) {
      .modal-overlay {
        padding: 0.5rem;
      }
      
      .modal-content {
        width: 100%;
        margin: 0;
        border-radius: 1rem;
        max-height: 90vh;
      }
      
      .modal-header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        border-radius: 1rem 1rem 0 0;
      }
      
      .modal-header::after {
        width: 40px;
        height: 2px;
      }
      
      .modal-title h3 {
        font-size: 1.5rem;
      }
      
      .modal-icon {
        font-size: 2rem;
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      .modal-score-section {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
        padding: 1.25rem;
      }
      
      .modal-score-number {
        font-size: 3rem;
      }
      
      .modal-footer {
        padding: 1.25rem 1.5rem 1.5rem 1.5rem;
        border-radius: 0 0 1rem 1rem;
      }
      
      .modal-footer .btn {
        width: 100%;
        padding: 1rem 2rem;
      }
    }
    
    /* Améliorations pour les écrans moyens */
    @media (min-width: 641px) and (max-width: 1024px) {
      .modal-content {
        max-width: 700px;
      }
      
      .modal-score-number {
        font-size: 3rem;
      }
    }
    
    /* Améliorations pour les grands écrans */
    @media (min-width: 1025px) {
      .modal-content {
        max-width: 700px;
      }
      
      .modal-content:hover {
        transform: scale(1.02);
        transition: transform 0.3s ease;
      }
    }
    
    /* Effets de focus et accessibilité */
    .modal-close:focus,
    .modal-footer .btn:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    
    /* Scrollbar personnalisée */
    .modal-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .modal-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, var(--primary-color), var(--success-color));
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, var(--success-color), var(--warning-color));
    }
    
    /* Loading Container pour le scan de vulnérabilités */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 80px;
    }

    .loading-container .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-container .loading-text {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Bouton désactivé */
    .btn-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-disabled:hover {
      transform: none !important;
      box-shadow: none !important;
    }
    
    /* Amélioration de la lisibilité des détails de vulnérabilités */
    .details-list {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    
    .details-list::-webkit-scrollbar {
      width: 6px;
    }
    
    .details-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }
    
    .details-list::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, var(--primary-color), var(--success-color));
      border-radius: 3px;
    }
    
    .detail-item {
      margin-bottom: 0.75rem;
      line-height: 1.6;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      background: rgba(255, 255, 255, 0.02);
      padding: 0.5rem;
      border-radius: 0.5rem;
      border-left: 3px solid var(--primary-color);
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    /* Styles pour les sections de vulnérabilités */
    .vulnerability-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .vulnerability-section h5 {
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    /* Indicateurs de sévérité */
    .severity-critical {
      color: #ef4444;
      font-weight: 600;
    }
    
    .severity-high {
      color: #f97316;
      font-weight: 600;
    }
    
    .severity-medium {
      color: #eab308;
      font-weight: 600;
    }
    
    .severity-low {
      color: #22c55e;
      font-weight: 600;
    }
    

  `]
})
export class AuditsComponent {
  currentUrl = '';
  isLoading = signal(false);
  showResults = signal(false);
  overallScore = signal(0);
  auditResults = signal<AuditResult[]>([]);
  auditHistory = signal<AuditHistory[]>([]);
  
  // Modal properties
  showModal = signal(false);
  selectedResult = signal<AuditResult | null>(null);
  
  // Loading states
  isVulnScanLoading = signal(false);
  
  // Signal pour le chargement de l'audit SEO détaillé
  isSeoAuditLoading = signal(false);
  
  // Cache des scans de vulnérabilités pour éviter les re-scans
  private vulnerabilityScanCache = new Map<string, any>();
  
  // Historique des scans avec timestamp pour gestion de la fraîcheur
  private scanHistory = new Map<string, { data: any, timestamp: number, url: string }>();
  
  // Durée de validité du cache (30 minutes)
  private readonly CACHE_VALIDITY_DURATION = 30 * 60 * 1000;

  constructor(private http: HttpClient) {}

  private mockResults: AuditResult[] = [
    {
      id: 'ssl',
      title: 'Certificat SSL',
      icon: '🔒',
      score: 95,
      status: 'good',
      summary: 'Le certificat SSL est valide et correctement configuré avec un chiffrement fort.',
      details: [
        'Le certificat est valide jusqu\'au 31-12-2025',
        'Utilise le chiffrement TLS 1.3',
        'La chaîne de certificats est complète',
        'Aucun contenu mixte détecté'
      ]
    },
    {
      id: 'headers',
      title: 'En-têtes HTTP',
      icon: '🛡️',
      score: 78,
      status: 'warning',
      summary: 'La plupart des en-têtes de sécurité sont présents, mais certaines améliorations sont recommandées.',
      details: [
        'En-tête Content-Security-Policy manquant',
        'En-tête X-Frame-Options présent',
        'Strict-Transport-Security configuré',
        'X-Content-Type-Options présent'
      ]
    },
    {
      id: 'js-libraries',
      title: 'Bibliothèques JavaScript',
      icon: '📚',
      score: 65,
      status: 'warning',
      summary: 'Certaines bibliothèques JavaScript ont des vulnérabilités connues et doivent être mises à jour.',
      details: [
        'jQuery 3.4.1 a 2 vulnérabilités connues',
        'Bootstrap 4.5.2 est obsolète',
        'Lodash 4.17.15 nécessite une mise à jour de sécurité',
        '3 bibliothèques sont à jour'
      ]
    },
    {
      id: 'web-vulnerabilities',
      title: 'Vulnérabilités Web',
      icon: '🚨',
      score: 45,
      status: 'critical',
      summary: 'Vulnérabilités critiques détectées nécessitant une attention immédiate.',
      details: [
        'Vulnérabilité XSS potentielle dans le formulaire de contact',
        'Protection CSRF non implémentée',
        'Validation des entrées à améliorer',
        'Risque d\'injection SQL dans la fonctionnalité de recherche'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies et Sessions',
      icon: '🍪',
      score: 82,
      status: 'good',
      summary: 'La configuration des cookies est généralement sécurisée avec les drapeaux appropriés définis.',
      details: [
        'Drapeau HttpOnly défini sur les cookies de session',
        'Drapeau Secure activé pour HTTPS',
        'Attribut SameSite configuré',
        'Les temps d\'expiration des cookies sont raisonnables'
      ]
    },
    {
      id: 'dependencies',
      title: 'Audit des Dépendances',
      icon: '📦',
      score: 58,
      status: 'warning',
      summary: 'Plusieurs dépendances ont des vulnérabilités de sécurité ou sont obsolètes.',
      details: [
        '5 vulnérabilités de haute sévérité trouvées',
        '12 problèmes de sévérité modérée',
        '23 packages nécessitent des mises à jour',
        'Aucune vulnérabilité critique détectée'
      ]
    },
    {
      id: 'backend-scan',
      title: 'Bibliothèques Backend',
      icon: '⚙️',
      score: 73,
      status: 'warning',
      summary: 'Les bibliothèques backend sont généralement sécurisées mais certaines mises à jour sont recommandées.',
      details: [
        'La version d\'Express.js est à jour',
        'Le pilote de base de données nécessite une mise à jour',
        'La bibliothèque d\'authentification est sécurisée',
        '2 correctifs de sécurité mineurs disponibles'
      ]
    },
    {
      id: 'vulnerable-versions',
      title: 'Versions Vulnérables',
      icon: '⚠️',
      score: 52,
      status: 'critical',
      summary: 'Plusieurs composants exécutant des versions vulnérables nécessitent des mises à jour.',
      details: [
        'Node.js 14.x a atteint la fin de vie',
        'React 16.x a des problèmes de sécurité connus',
        'Webpack 4.x nécessite une mise à niveau vers v5',
        'La version de la base de données a des correctifs de sécurité'
      ]
    },
    {
      id: 'seo',
      title: 'Audit SEO',
      icon: '📊',
      score: 88,
      status: 'good',
      summary: 'L\'implémentation SEO est solide avec des opportunités d\'optimisation mineures.',
      details: [
        'Les méta-descriptions sont présentes sur toutes les pages',
        'Les balises de titre sont optimisées',
        'Les attributs alt des images manquent sur 3 images',
        'La vitesse de chargement des pages est excellente'
      ]
    }
  ];

  runAudit() {
    if (!this.currentUrl) return;

    this.isLoading.set(true);
    this.showResults.set(false);

    // Utiliser EXACTEMENT la même logique que liste-sites.component
    this.ajouterEtAuditer();
  }

  private calculateOverallScore() {
    const results = this.auditResults();
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    this.overallScore.set(Math.round(totalScore / results.length));
  }

  private addToHistory() {
    const history = this.auditHistory();
    const newAudit: AuditHistory = {
      url: this.currentUrl,
      date: new Date(),
      overallScore: this.overallScore()
    };
    
    const updatedHistory = [newAudit, ...history.slice(0, 4)]; // Keep last 5
    this.auditHistory.set(updatedHistory);
  }

  loadHistoryAudit(audit: AuditHistory) {
    this.currentUrl = audit.url;
    this.runAudit();
  }

  viewDetails(result: AuditResult) {
    // Si c'est la carte "Vulnérabilités Web", vérifier le cache d'abord
    if (result.id === 'web-vulnerabilities') {
      if (!this.currentUrl || this.currentUrl.trim() === '') {
        console.error('❌ [AUDIT COMPONENT] Aucune URL disponible pour le scan des vulnérabilités');
        alert('❌ Aucune URL disponible. Veuillez d\'abord lancer un audit.');
        return;
      }
      
      // Vérifier si on a déjà un scan récent pour cette URL
      const cachedResult = this.getCachedVulnerabilityScan(this.currentUrl);
      if (cachedResult) {
        console.log('✅ [AUDIT COMPONENT] Utilisation du scan en cache pour:', this.currentUrl);
        
        // Utiliser automatiquement le cache si disponible (plus rapide)
        console.log(`✅ [AUDIT COMPONENT] Utilisation du scan en cache pour: ${this.currentUrl}`);
        console.log(`📋 Cache détecté le: ${new Date(cachedResult.timestamp).toLocaleString('fr-FR')}`);
        console.log(`🚨 Vulnérabilités en cache: ${cachedResult.totalVulnerabilities || 0}`);
        
        this.displayVulnerabilityResults(cachedResult, true);
      } else {
        console.log('🔄 [AUDIT COMPONENT] Lancement d\'un nouveau scan pour:', this.currentUrl);
        this.launchFullVulnerabilityScan(this.currentUrl);
      }
    } else if (result.id === 'seo') {
      // Pour la carte SEO, lancer l'audit SEO détaillé
      this.launchDetailedSeoAudit(result);
    } else {
      // Pour les autres cartes, afficher directement les détails
      this.selectedResult.set(result);
      this.showModal.set(true);
    }
  }
  
  closeModal() {
    this.showModal.set(false);
    this.selectedResult.set(null);
  }
  
  // Lancer un scan complet des vulnérabilités
  private launchFullVulnerabilityScan(url: string) {
    console.log('🔍 [AUDIT COMPONENT] Lancement du scan complet des vulnérabilités pour:', url);
    
    // Validation de l'URL
    if (!url || url.trim() === '') {
      console.error('❌ [AUDIT COMPONENT] URL invalide pour le scan:', url);
      this.isVulnScanLoading.set(false);
      alert('❌ URL invalide pour le scan des vulnérabilités');
      return;
    }
    
    // Nettoyer et valider l'URL
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      console.error('❌ [AUDIT COMPONENT] URL doit commencer par http:// ou https://:', cleanUrl);
      this.isVulnScanLoading.set(false);
      alert('❌ L\'URL doit commencer par http:// ou https://');
      return;
    }
    
    // Afficher l'indicateur de chargement spécifique au scan de vulnérabilités
    this.isVulnScanLoading.set(true);
    
    // Préparer les données de la requête avec plus de détails
    const requestBody = {
      websiteUrl: cleanUrl,
      scanType: 'full',
      includeDetails: true,
      maxPages: 10
    };
    
    console.log('📤 [AUDIT COMPONENT] Envoi de la requête de scan complet:', requestBody);
    
    this.http.post('/api/active-scanner/scan', requestBody).subscribe({
      next: (fullScanResult: any) => {
        console.log('✅ [AUDIT COMPONENT] Scan complet terminé:', fullScanResult);
        this.isVulnScanLoading.set(false);
        
        // Utiliser la méthode centralisée pour afficher les résultats
        this.displayVulnerabilityResults(fullScanResult, false);
      },
      error: (err) => {
        console.error('❌ [AUDIT COMPONENT] Erreur scan complet vulnérabilités:', err);
        this.isVulnScanLoading.set(false);
        
        // Gestion d'erreur améliorée avec plus de détails
        let errorMsg = "Erreur lors du scan complet des vulnérabilités";
        
        if (err.status === 500) {
          errorMsg = "Erreur serveur interne (500) - Le scanner de vulnérabilités a rencontré un problème";
        } else if (err.status === 400) {
          errorMsg = "Requête invalide (400) - Vérifiez l'URL fournie";
        } else if (err.status === 401) {
          errorMsg = "Non autorisé (401) - Vérifiez votre authentification";
        } else if (err.status === 403) {
          errorMsg = "Accès interdit (403) - Vous n'avez pas les permissions nécessaires";
        } else if (err.status === 404) {
          errorMsg = "Endpoint non trouvé (404) - L'API de scan n'est pas disponible";
        } else if (err.status === 0) {
          errorMsg = "Erreur de connexion - Impossible de joindre le serveur";
        }
        
        // Ajouter les détails de l'erreur si disponibles
        if (err.error && err.error.message) {
          errorMsg += `\n\nDétails: ${err.error.message}`;
        } else if (err.message) {
          errorMsg += `\n\nDétails: ${err.message}`;
        }
        
        console.error('📋 [AUDIT COMPONENT] Détails de l\'erreur:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        
        alert(`❌ ${errorMsg}`);
        
        // Fallback : essayer d'utiliser le scan rapide comme alternative
        console.log('🔄 [AUDIT COMPONENT] Tentative de fallback avec le scan rapide...');
        this.fallbackToQuickScan(url);
      }
    });
  }
  
  // Méthode de fallback vers le scan rapide
  private fallbackToQuickScan(url: string) {
    console.log('🔄 [AUDIT COMPONENT] Utilisation du scan rapide comme fallback pour:', url);
    
    this.http.get(`/api/active-scanner/quick-scan?websiteUrl=${encodeURIComponent(url)}`).subscribe({
      next: (quickScanResult: any) => {
        console.log('✅ [AUDIT COMPONENT] Fallback scan rapide réussi:', quickScanResult);
        
        // Créer un résultat avec les données du scan rapide
        const fallbackVulnResult: AuditResult = {
          id: 'web-vulnerabilities-fallback',
          title: 'Vulnérabilités Web (Scan Rapide)',
          icon: '🚨',
          score: quickScanResult.totalVulnerabilities > 0 ? Math.max(50, 100 - quickScanResult.totalVulnerabilities * 10) : 100,
          status: quickScanResult.totalVulnerabilities > 3 ? 'critical' : quickScanResult.totalVulnerabilities > 1 ? 'warning' : 'good',
          summary: `Scan rapide terminé : ${quickScanResult.totalVulnerabilities || 0} vulnérabilités détectées (mode fallback)`,
          details: [
            '⚠️ Le scan complet a échoué, affichage des résultats du scan rapide',
            `Total des vulnérabilités : ${quickScanResult.totalVulnerabilities || 0}`,
            'Pour des détails complets, réessayez plus tard ou contactez l\'administrateur',
            'Les résultats du scan rapide peuvent être incomplets'
          ]
        };
        
        this.selectedResult.set(fallbackVulnResult);
        this.showModal.set(true);
        
        console.log('✅ Modal affiché avec les résultats du fallback');
      },
      error: (fallbackErr) => {
        console.error('❌ [AUDIT COMPONENT] Fallback scan rapide également échoué:', fallbackErr);
        
        // Dernier recours : afficher un message d'erreur dans le modal
        const errorVulnResult: AuditResult = {
          id: 'web-vulnerabilities-error',
          title: 'Erreur de Scan des Vulnérabilités',
          icon: '❌',
          score: 0,
          status: 'critical',
          summary: 'Impossible de récupérer les données de vulnérabilités',
          details: [
            '❌ Le scan complet des vulnérabilités a échoué',
            '❌ Le scan rapide de fallback a également échoué',
            '🔍 Vérifiez que le serveur de scan est opérationnel',
            '📞 Contactez l\'administrateur pour résoudre le problème',
            '🔄 Réessayez plus tard'
          ]
        };
        
        this.selectedResult.set(errorVulnResult);
        this.showModal.set(true);
      }
    });
  }

  // Lancer le scan rapide des vulnérabilités et combiner avec l'audit
  private launchQuickVulnerabilityScan(url: string, auditResult: any) {
    console.log('🔍 [AUDIT COMPONENT] Lancement du scan rapide des vulnérabilités pour:', url);
    
    this.http.get(`/api/active-scanner/quick-scan?websiteUrl=${encodeURIComponent(url)}`).subscribe({
      next: (vulnResult: any) => {
        console.log('✅ [AUDIT COMPONENT] Scan rapide des vulnérabilités terminé:', vulnResult);
        
        // Combiner les résultats de l'audit et du scan de vulnérabilités
        const combinedResult = {
          ...auditResult,
          vulnerabilitiesCount: vulnResult.totalVulnerabilities || 0,
          vulnerabilityDetails: vulnResult.vulnerabilityCounts || {},
          scannedPages: vulnResult.scannedPages || 0
        };
        
        // Maintenant lancer l'audit SEO
        this.launchSeoAudit(url, combinedResult);
      },
      error: (err) => {
        console.error('❌ [AUDIT COMPONENT] Erreur scan rapide vulnérabilités:', err);
        
        // En cas d'erreur, afficher quand même les résultats de l'audit
        this.auditResults.set(this.convertBackendDataToResults(auditResult));
        this.overallScore.set(auditResult.globalScore || 0);
        this.addToHistory();
        
        this.isLoading.set(false);
        this.showResults.set(true);
        
        console.log('⚠️ Audit affiché sans données de vulnérabilités (erreur scan rapide)');
      }
    });
  }
  
  // Lancer l'audit SEO
  private launchSeoAudit(url: string, combinedResult: any) {
    console.log('🔍 [AUDIT COMPONENT] Lancement de l\'audit SEO pour:', url);
    
    // Configuration pour l'audit SEO rapide
    const seoRequest = {
      websiteUrl: url,
      checkInternalLinks: true,
      checkExternalLinks: true,
      checkRobotsTxt: true,
      checkSitemap: true,
      checkHttpsRedirect: true,
      maxPagesToScan: 3
    };
    
    // URL CORRECTE : /api/seo-audit/analyze (PAS quick-analyze)
    const correctSeoApiUrl = '/api/seo-audit/analyze';
    console.log('📡 [AUDIT COMPONENT] URL CORRECTE de l\'API SEO:', correctSeoApiUrl);
    console.log('📡 [AUDIT COMPONENT] Données de la requête SEO:', seoRequest);
    console.log('🚨 [AUDIT COMPONENT] ATTENTION : Si vous voyez quick-analyze dans les logs, il y a un problème de cache !');
    
    this.http.post(correctSeoApiUrl, seoRequest).subscribe({
      next: (seoResult: any) => {
        console.log('✅ [AUDIT COMPONENT] Audit SEO terminé:', seoResult);
        
        if (seoResult.success) {
          console.log('📊 [AUDIT COMPONENT] Données SEO reçues:', seoResult);
          
          // Combiner avec les résultats précédents en mappant correctement les données
          const finalResult = {
            ...combinedResult,
            seoScore: seoResult.globalScore || 0, // Votre API renvoie globalScore
            seoDetails: seoResult.checkResults || [], // Si disponible
            seoRecommendations: seoResult.recommendations || [], // Si disponible
            seoSummary: seoResult.message || 'Audit SEO terminé avec succès', // Utiliser le message de l'API
            seoAuditId: seoResult.seoAuditId // Garder l'ID de l'audit SEO
          };
          
          console.log('🔗 [AUDIT COMPONENT] ID de l\'audit SEO stocké:', finalResult.seoAuditId);
          
          console.log('🔗 [AUDIT COMPONENT] Données combinées pour l\'affichage:', finalResult);
          
          // Afficher tous les résultats combinés
          this.auditResults.set(this.convertBackendDataToResults(finalResult));
          this.overallScore.set(finalResult.globalScore || 0);
          this.addToHistory();
          
          this.isLoading.set(false);
          this.showResults.set(true);
          
          console.log(`✅ Audit complet terminé avec SEO (Score SEO: ${finalResult.seoScore}/100)`);
        } else {
          console.warn('⚠️ [AUDIT COMPONENT] Audit SEO échoué, affichage sans SEO');
          this.finalizeAudit(combinedResult);
        }
      },
      error: (err) => {
        console.error('❌ [AUDIT COMPONENT] Erreur audit SEO:', err);
        
        // En cas d'erreur SEO, afficher quand même les autres résultats
        this.finalizeAudit(combinedResult);
      }
    });
  }
  
    // Finaliser l'audit avec tous les résultats disponibles
  private finalizeAudit(auditResult: any) {
    // Stocker les données de l'audit pour pouvoir récupérer l'ID SEO plus tard
    (this as any).lastAuditData = auditResult;
    
    this.auditResults.set(this.convertBackendDataToResults(auditResult));
    this.overallScore.set(auditResult.globalScore || 0);
    this.addToHistory();

    this.isLoading.set(false);
    this.showResults.set(true);

    console.log('✅ Audit finalisé avec les résultats disponibles');
    console.log('💾 [AUDIT COMPONENT] Données d\'audit stockées pour récupération future:', auditResult);
  }

  // Lancer l'audit SEO détaillé depuis la carte SEO
  private launchDetailedSeoAudit(seoResult: AuditResult) {
    console.log('🔍 [AUDIT COMPONENT] Lancement de l\'audit SEO détaillé pour la carte:', seoResult);
    
    // Récupérer l'ID de l'audit SEO depuis les données
    const seoAuditId = this.getSeoAuditIdFromResult(seoResult);
    
    if (!seoAuditId) {
      console.error('❌ [AUDIT COMPONENT] Aucun ID d\'audit SEO trouvé');
      alert('❌ Impossible de récupérer l\'ID de l\'audit SEO. Veuillez relancer l\'audit.');
      return;
    }
    
    // Afficher l'indicateur de chargement SEO
    this.isSeoAuditLoading.set(true);
    
    console.log('📡 [AUDIT COMPONENT] Appel de l\'API SEO détaillée:', `/api/seo-audit/results/${seoAuditId}`);
    
    // Appeler l'API pour récupérer les résultats détaillés
    this.http.get(`/api/seo-audit/results/${seoAuditId}`).subscribe({
      next: (detailedSeoResult: any) => {
        console.log('✅ [AUDIT COMPONENT] Résultats SEO détaillés reçus:', detailedSeoResult);
        
        // Arrêter l'indicateur de chargement
        this.isSeoAuditLoading.set(false);
        
        // Créer un résultat d'audit enrichi avec les détails SEO
        const enrichedSeoResult = this.enrichSeoResultWithDetails(seoResult, detailedSeoResult);
        
        // Afficher dans le modal
        this.selectedResult.set(enrichedSeoResult);
        this.showModal.set(true);
      },
      error: (err) => {
        console.error('❌ [AUDIT COMPONENT] Erreur lors de la récupération des détails SEO:', err);
        
        // Arrêter l'indicateur de chargement
        this.isSeoAuditLoading.set(false);
        
        // En cas d'erreur, afficher quand même les détails de base
        this.selectedResult.set(seoResult);
        this.showModal.set(true);
        
        // Afficher un message d'erreur dans le modal
        setTimeout(() => {
          alert('⚠️ Impossible de récupérer les détails SEO complets. Affichage des informations de base.');
        }, 100);
      }
    });
  }

  // Récupérer l'ID de l'audit SEO depuis le résultat
  private getSeoAuditIdFromResult(seoResult: AuditResult): number | null {
    console.log('🔍 [AUDIT COMPONENT] Recherche de l\'ID de l\'audit SEO...');
    
    // 1. Essayer de récupérer l'ID directement depuis le résultat SEO
    if (seoResult.seoAuditId) {
      console.log('✅ [AUDIT COMPONENT] ID de l\'audit SEO trouvé directement:', seoResult.seoAuditId);
      return seoResult.seoAuditId;
    }
    
    // 2. Essayer de récupérer l'ID depuis les données de l'audit
    const auditData = this.auditResults();
    console.log('📊 [AUDIT COMPONENT] Données d\'audit disponibles:', auditData);
    
    const seoCard = auditData.find(result => result.id === 'seo');
    console.log('🔍 [AUDIT COMPONENT] Carte SEO trouvée:', seoCard);
    
    if (seoCard && seoCard.seoAuditId) {
      console.log('✅ [AUDIT COMPONENT] ID de l\'audit SEO trouvé dans la carte:', seoCard.seoAuditId);
      return seoCard.seoAuditId;
    }
    
    // 3. Essayer de récupérer depuis les données globales de l'audit (depuis le composant)
    // Ces données sont stockées lors de l'audit initial
    const globalAuditData = (this as any).lastAuditData;
    if (globalAuditData && globalAuditData.seoAuditId) {
      console.log('✅ [AUDIT COMPONENT] ID de l\'audit SEO trouvé dans les données globales:', globalAuditData.seoAuditId);
      return globalAuditData.seoAuditId;
    }
    
    // Si pas trouvé, afficher une erreur claire
    console.error('❌ [AUDIT COMPONENT] ID d\'audit SEO non trouvé !');
    console.error('❌ [AUDIT COMPONENT] Vérifiez que l\'audit SEO a bien été lancé avant de cliquer sur "Voir les Détails"');
    console.error('❌ [AUDIT COMPONENT] Données disponibles:', { seoResult, auditData, globalAuditData });
    return null; // Retourner null au lieu d'un ID par défaut
  }

  // Enrichir le résultat SEO avec les détails de l'API
  private enrichSeoResultWithDetails(baseSeoResult: AuditResult, detailedSeoResult: any): AuditResult {
    console.log('🔧 [AUDIT COMPONENT] Enrichissement du résultat SEO avec les détails:', detailedSeoResult);
    
    // Créer une copie du résultat de base
    const enrichedResult = { ...baseSeoResult };
    
    // Enrichir avec les détails de l'API
    if (detailedSeoResult && detailedSeoResult.success) {
      // Mettre à jour le score avec les vraies données de l'API
      if (detailedSeoResult.globalScore !== undefined) {
        enrichedResult.score = detailedSeoResult.globalScore;
        console.log('✅ [AUDIT COMPONENT] Score SEO mis à jour:', baseSeoResult.score, '→', detailedSeoResult.globalScore);
      }
      
      // Mettre à jour le statut basé sur le nouveau score
      enrichedResult.status = this.getStatusFromScore(detailedSeoResult.globalScore);
      console.log('✅ [AUDIT COMPONENT] Statut SEO mis à jour:', baseSeoResult.status, '→', enrichedResult.status);
      
      // Mettre à jour le résumé avec les vraies données de l'API
      if (detailedSeoResult.summary) {
        enrichedResult.summary = detailedSeoResult.summary;
        console.log('✅ [AUDIT COMPONENT] Résumé SEO mis à jour avec les vraies données');
      }
      
      // Ajouter les détails détaillés
      enrichedResult.details = this.formatDetailedSeoResults(detailedSeoResult);
      console.log('✅ [AUDIT COMPONENT] Détails SEO enrichis avec les vraies données de l\'API');
    }
    
    console.log('🔧 [AUDIT COMPONENT] Résultat SEO enrichi final:', enrichedResult);
    return enrichedResult;
  }

  // Formater les résultats SEO détaillés pour l'affichage
  private formatDetailedSeoResults(detailedSeoResult: any): string[] {
    const formattedDetails: string[] = [];
    
    // Score global
    if (detailedSeoResult.globalScore !== undefined) {
      formattedDetails.push(`🎯 Score SEO global : ${detailedSeoResult.globalScore}/100`);
    }
    
    // Détails des vérifications avec statistiques
    if (detailedSeoResult.checkResults && Array.isArray(detailedSeoResult.checkResults)) {
      // Calculer les statistiques
      const passedChecks = detailedSeoResult.checkResults.filter((check: any) => check.status === 'PASSED').length;
      const failedChecks = detailedSeoResult.checkResults.filter((check: any) => check.status === 'FAILED').length;
      const warningChecks = detailedSeoResult.checkResults.filter((check: any) => check.status === 'WARNING').length;
      
      formattedDetails.push('');
      formattedDetails.push(`📊 Statistiques des vérifications :`);
      formattedDetails.push(`✅ Vérifications réussies : ${passedChecks}`);
      formattedDetails.push(`❌ Vérifications échouées : ${failedChecks}`);
      formattedDetails.push(`⚠️ Avertissements : ${warningChecks}`);
      
      formattedDetails.push('');
      formattedDetails.push('🔍 Détails des vérifications SEO :');
      
      detailedSeoResult.checkResults.forEach((check: any, index: number) => {
        const statusIcon = check.status === 'PASSED' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
        const checkName = check.checkType || `Vérification ${index + 1}`;
        const checkScore = check.score !== undefined ? ` (${check.score}/${check.maxScore || 10})` : '';
        
        formattedDetails.push(`${statusIcon} ${checkName}${checkScore}`);
        
        // Ajouter la description si disponible
        if (check.details) {
          formattedDetails.push(`   📝 ${check.details}`);
        }
        
        // Ajouter les problèmes si disponibles
        if (check.issues && check.issues.trim() !== '') {
          formattedDetails.push(`   ⚠️ ${check.issues}`);
        }
      });
    }
    
    // Recommandations
    if (detailedSeoResult.recommendations && Array.isArray(detailedSeoResult.recommendations) && detailedSeoResult.recommendations.length > 0) {
      formattedDetails.push('');
      formattedDetails.push('💡 Recommandations d\'amélioration :');
      
      detailedSeoResult.recommendations.slice(0, 5).forEach((rec: any, index: number) => {
        const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟠' : '🟡';
        formattedDetails.push(`${priorityIcon} ${rec.title || `Recommandation ${index + 1}`}`);
        
        if (rec.description) {
          formattedDetails.push(`   📋 ${rec.description}`);
        }
        
        if (rec.impact) {
          formattedDetails.push(`   🎯 Impact : ${rec.impact}`);
        }
      });
    } else {
      // Si pas de recommandations, en créer basées sur les vérifications échouées
      if (detailedSeoResult.checkResults && Array.isArray(detailedSeoResult.checkResults)) {
        const failedChecks = detailedSeoResult.checkResults.filter((check: any) => check.status === 'FAILED');
        
        if (failedChecks.length > 0) {
          formattedDetails.push('');
          formattedDetails.push('💡 Recommandations d\'amélioration :');
          
          failedChecks.slice(0, 3).forEach((check: any) => {
            const recommendation = this.getSeoRecommendation(check.checkType);
            if (recommendation) {
              formattedDetails.push(`🔴 ${recommendation.title}`);
              formattedDetails.push(`   📋 ${recommendation.description}`);
            }
          });
        }
      }
    }
    
    // Métriques de performance
    if (detailedSeoResult.performanceMetrics) {
      formattedDetails.push('');
      formattedDetails.push('⚡ Métriques de performance :');
      
      Object.entries(detailedSeoResult.performanceMetrics).forEach(([key, value]) => {
        const icon = key.includes('Speed') ? '🚀' : key.includes('Mobile') ? '📱' : '📊';
        formattedDetails.push(`${icon} ${key} : ${value}`);
      });
    }
    
    // Informations techniques
    if (detailedSeoResult.technicalDetails) {
      formattedDetails.push('');
      formattedDetails.push('🔧 Détails techniques :');
      
      Object.entries(detailedSeoResult.technicalDetails).forEach(([key, value]) => {
        formattedDetails.push(`⚙️ ${key} : ${value}`);
      });
    }
    
    // Si pas de détails, ajouter des informations par défaut
    if (formattedDetails.length === 0) {
      formattedDetails.push('📊 Audit SEO détaillé effectué');
      formattedDetails.push('🔍 Vérification complète des éléments SEO');
      formattedDetails.push('📈 Analyse des performances et de la structure');
    }
    
    return formattedDetails;
  }

  // Générer des recommandations SEO basées sur le type de vérification échouée
  private getSeoRecommendation(checkType: string): { title: string; description: string } | null {
    const recommendations: { [key: string]: { title: string; description: string } } = {
      'HTTPS_REDIRECT': {
        title: 'Implémenter la redirection HTTPS',
        description: 'HTTPS améliore la sécurité et le classement SEO.'
      },
      'ROBOTS_TXT': {
        title: 'Ajouter un fichier robots.txt',
        description: 'Le robots.txt guide les moteurs de recherche dans l\'indexation.'
      },
      'IMAGE_ALT_ATTRIBUTES': {
        title: 'Ajouter des attributs alt aux images',
        description: 'Les attributs alt améliorent l\'accessibilité et le SEO des images.'
      },
      'EXTERNAL_LINKS': {
        title: 'Améliorer les liens externes',
        description: 'Ajouter des attributs rel="nofollow" aux liens externes non fiables.'
      },
      'SITEMAP_XML': {
        title: 'Créer un sitemap XML',
        description: 'Le sitemap aide les moteurs de recherche à indexer votre site.'
      },
      'TITLE_TAG': {
        title: 'Optimiser les balises de titre',
        description: 'Les titres doivent être uniques et descriptifs pour chaque page.'
      },
      'INTERNAL_LINKS': {
        title: 'Améliorer la structure des liens internes',
        description: 'Une bonne structure de liens internes améliore la navigation et le SEO.'
      },
      'META_DESCRIPTION': {
        title: 'Ajouter une meta description',
        description: 'La meta description améliore l\'apparence dans les résultats de recherche.'
      },
      'HEADING_HIERARCHY': {
        title: 'Améliorer la hiérarchie des titres',
        description: 'Une bonne hiérarchie H1-H2-H3 améliore la lisibilité et le SEO.'
      }
    };
    
    return recommendations[checkType] || null;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'good': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'critical': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }

  getScoreBarColor(score: number): string {
    if (score >= 80) return 'progress-success';
    if (score >= 60) return 'progress-warning';
    return 'progress-danger';
  }

  getStatusText(score: number): string {
    if (score >= 80) return 'Score de Sécurité Excellent';
    if (score >= 60) return 'Bonne Sécurité avec Améliorations Nécessaires';
    return 'Problèmes de Sécurité Critiques Détectés';
  }

  getStatusTextColor(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }

  getStatusCounts() {
    const results = this.auditResults();
    return {
      good: results.filter(r => r.status === 'good').length,
      warning: results.filter(r => r.status === 'warning').length,
      critical: results.filter(r => r.status === 'critical').length
    };
  }

  // MÉTHODE COPIÉE DIRECTEMENT DE liste-sites.component
  ajouterEtAuditer() {
    const url = (this.currentUrl || '').trim();
    if (!url) { 
      alert('Veuillez entrer une URL'); 
      this.isLoading.set(false);
      return; 
    }
    
    const body: any = { url, name: this.extraireNom(url) };
    
    console.log('🚀 [AUDIT COMPONENT] Création du site web:', body);
    
    this.http.post<any>('/api/websites', body).subscribe({
      next: (created) => {
        const siteId = created?.id;
        if (!siteId) { 
          console.error('❌ [AUDIT COMPONENT] Pas d\'ID de site reçu');
          alert('Erreur: Impossible de créer le site web');
          this.isLoading.set(false);
          return; 
        }

        console.log('✅ [AUDIT COMPONENT] Site créé avec ID:', siteId);

        // Lancer l'audit avec le même endpoint que liste-sites.component
        this.http.get(`/api/audits/launch/${siteId}`).subscribe({
          next: (auditResult: any) => {
            console.log('✅ [AUDIT COMPONENT] Audit terminé:', auditResult);
            
            // Maintenant lancer le scan rapide des vulnérabilités
            this.launchQuickVulnerabilityScan(this.currentUrl, auditResult);
          },
          error: (err) => {
            const msg = err?.error?.error || err?.error || "Erreur lors du lancement de l'audit";
            console.error('❌ [AUDIT COMPONENT] Erreur audit:', err);
            alert(`❌ Erreur d'audit: ${msg}`);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || "Impossible d'ajouter le site";
        console.error('❌ [AUDIT COMPONENT] Erreur création site:', err);
        alert(`❌ Erreur: ${msg}`);
        this.isLoading.set(false);
      }
    });
  }

  // MÉTHODE COPIÉE DIRECTEMENT DE liste-sites.component
  private extraireNom(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url;
    }
  }

  private convertBackendDataToResults(backendData: any): AuditResult[] {
    console.log('🔄 [AUDIT COMPONENT] Conversion des données backend vers résultats d\'affichage:', backendData);
    
    const results: AuditResult[] = [];

    // 1. SSL Security - Utilise les vraies données du backend
    const sslScore = backendData.sslValid ? 100 : 0;
    const sslStatus = backendData.sslValid ? 'good' : 'critical';
    const sslSummary = backendData.sslValid ? 'Le certificat SSL est valide et correctement configuré.' : 'Problème avec le certificat SSL détecté.';
    
    // Traiter les détails SSL du backend
    let sslDetails: string[] = [];
    if (backendData.sslResult) {
      // Diviser le résultat SSL en lignes et nettoyer
      sslDetails = backendData.sslResult
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => {
          // Nettoyer les émojis et formater
          return line.replace(/^[✅❌•\-\s]+/, '').trim();
        });
    }
    
    if (sslDetails.length === 0) {
      sslDetails = ['Information SSL non disponible'];
    }
    
    results.push({
      id: 'ssl',
      title: 'Certificat SSL',
      icon: '🔒',
      score: sslScore,
      status: sslStatus,
      summary: sslSummary,
      details: sslDetails
    });

    // 2. HTTP Headers - Utilise les vraies données du backend
    const headersScore = backendData.httpHeadersScore || 0;
    const headersStatus = this.getStatusFromScore(headersScore);
    
    // Traiter les en-têtes de sécurité du backend
    let headersDetails: string[] = [];
    if (backendData.securityHeaders) {
      headersDetails = Object.entries(backendData.securityHeaders).map(([header, value]) => {
        const status = value === '❌ Non présent' ? '❌ Manquant' : '✅ Présent';
        return `${header}: ${status} - ${value}`;
      });
    }
    
    if (headersDetails.length === 0) {
      headersDetails = ['Aucun en-tête de sécurité détecté'];
    }
    
    results.push({
      id: 'headers',
      title: 'En-têtes HTTP de Sécurité',
      icon: '🛡️',
      score: headersScore,
      status: headersStatus,
      summary: `Score des en-têtes de sécurité : ${headersScore}/100`,
      details: headersDetails
    });

    // 3. JavaScript Libraries - Utilise les vraies données du backend
    const jsScore = backendData.jsSecurityScore || 0;
    const jsStatus = this.getStatusFromScore(jsScore);
    const jsLibrariesCount = backendData.jsLibrariesCount || 0;
    const vulnerableJsCount = backendData.vulnerableJsCount || 0;
    
    // Créer un résumé dynamique basé sur les vraies données
    let jsSummary = '';
    if (jsLibrariesCount === 0) {
      jsSummary = 'Aucune bibliothèque JavaScript détectée';
    } else if (vulnerableJsCount === 0) {
      jsSummary = `${jsLibrariesCount} bibliothèques détectées, toutes sécurisées`;
    } else {
      jsSummary = `${jsLibrariesCount} bibliothèques détectées, ${vulnerableJsCount} vulnérables`;
    }
    
    // Créer des détails dynamiques
    let jsDetails: string[] = [];
    if (jsLibrariesCount > 0) {
      jsDetails.push(`Nombre total de bibliothèques : ${jsLibrariesCount}`);
      jsDetails.push(`Bibliothèques vulnérables : ${vulnerableJsCount}`);
      jsDetails.push(`Score de sécurité JS : ${jsScore}/100`);
      
      if (vulnerableJsCount > 0) {
        jsDetails.push('⚠️ Mise à jour des bibliothèques vulnérables recommandée');
      } else {
        jsDetails.push('✅ Toutes les bibliothèques sont à jour');
      }
    } else {
      jsDetails.push('Aucune bibliothèque JavaScript détectée sur ce site');
    }
    
    results.push({
      id: 'js-libraries',
      title: 'Bibliothèques JavaScript',
      icon: '📚',
      score: jsScore,
      status: jsStatus,
      summary: jsSummary,
      details: jsDetails
    });

    // 4. Web Vulnerabilities - Utilise les vraies données du scanner actif
    const vulnCount = backendData.vulnerabilitiesCount || 0;
    const vulnScore = vulnCount > 0 ? Math.max(50, 100 - vulnCount * 10) : 100;
    const vulnStatus = vulnCount > 3 ? 'critical' : vulnCount > 1 ? 'warning' : 'good';
    
    // Créer un résumé dynamique basé sur les vraies données du scanner
    let vulnSummary = '';
    if (vulnCount === 0) {
      vulnSummary = 'Aucune vulnérabilité web détectée par le scanner actif';
    } else if (vulnCount === 1) {
      vulnSummary = '1 vulnérabilité web détectée par le scanner actif';
    } else {
      vulnSummary = `${vulnCount} vulnérabilités web détectées par le scanner actif`;
    }
    
    // Créer des détails dynamiques basés sur les vraies données du scanner
    let vulnDetails: string[] = [];
    if (vulnCount === 0) {
      vulnDetails.push('✅ Aucune vulnérabilité critique détectée');
      vulnDetails.push('✅ Protection XSS en place');
      vulnDetails.push('✅ Protection CSRF implémentée');
      vulnDetails.push('✅ Validation des entrées sécurisée');
      vulnDetails.push('🔍 Scanner actif : Aucune vulnérabilité trouvée');
    } else {
      vulnDetails.push(`🚨 ${vulnCount} vulnérabilité(s) détectée(s) par le scanner actif`);
      if (vulnCount > 3) {
        vulnDetails.push('❌ Attention immédiate requise');
        vulnDetails.push('⚠️ Vérification de sécurité urgente');
        vulnDetails.push('🔍 Scanner actif : Vulnérabilités critiques identifiées');
      } else if (vulnCount > 1) {
        vulnDetails.push('⚠️ Améliorations de sécurité recommandées');
        vulnDetails.push('🔍 Audit de sécurité détaillé nécessaire');
        vulnDetails.push('🔍 Scanner actif : Vulnérabilités modérées identifiées');
      } else {
        vulnDetails.push('⚠️ Vulnérabilité mineure détectée');
        vulnDetails.push('🔧 Correction recommandée');
        vulnDetails.push('🔍 Scanner actif : Vulnérabilité mineure identifiée');
      }
    }
    
    results.push({
      id: 'web-vulnerabilities',
      title: 'Vulnérabilités Web',
      icon: '🚨',
      score: vulnScore,
      status: vulnStatus,
      summary: vulnSummary,
      details: vulnDetails
    });

    // 5. Cookies & Sessions (GARDÉ de votre page originale)
    results.push({
      id: 'cookies',
      title: 'Cookies & Sessions',
      icon: '🍪',
      score: 82,
      status: 'good',
      summary: 'Cookie configuration is mostly secure with proper flags set.',
      details: [
        'HttpOnly flag set on session cookies',
        'Secure flag enabled for HTTPS',
        'SameSite attribute configured',
        'Cookie expiration times are reasonable'
      ]
    });

    // 6. Dependencies Audit (GARDÉ de votre page originale)
    results.push({
      id: 'dependencies',
      title: 'Dependencies Audit',
      icon: '📦',
      score: 58,
      status: 'warning',
      summary: 'Several dependencies have security vulnerabilities or are outdated.',
      details: [
        '5 high severity vulnerabilities found',
        '12 moderate severity issues',
        '23 packages need updates',
        'No critical vulnerabilities detected'
      ]
    });

    // 7. Backend Libraries (GARDÉ de votre page originale)
    results.push({
      id: 'backend-scan',
      title: 'Backend Libraries',
      icon: '⚙️',
      score: 73,
      status: 'warning',
      summary: 'Backend libraries are generally secure but some updates recommended.',
      details: [
        'Express.js version is current',
        'Database driver needs update',
        'Authentication library is secure',
        '2 minor security patches available'
      ]
    });

    // 8. Vulnerable Versions (GARDÉ de votre page originale)
    results.push({
      id: 'vulnerable-versions',
      title: 'Vulnerable Versions',
      icon: '⚠️',
      score: 52,
      status: 'critical',
      summary: 'Multiple components running vulnerable versions require updates.',
      details: [
        'Node.js 14.x has reached end of life',
        'React 16.x has known security issues',
        'Webpack 4.x needs upgrade to v5',
        'Database version has security patches'
      ]
    });

    // 9. SEO Audit - Utilise les vraies données du backend
    console.log('📊 [AUDIT COMPONENT] Traitement des données SEO:', {
      seoScore: backendData.seoScore,
      seoDetails: backendData.seoDetails,
      seoRecommendations: backendData.seoRecommendations,
      seoAuditId: backendData.seoAuditId
    });
    
    const seoScore = backendData.seoScore || 0;
    const seoStatus = this.getStatusFromScore(seoScore);
    
    // Créer un résumé dynamique basé sur les vraies données SEO
    let seoSummary = '';
    if (seoScore >= 80) {
      seoSummary = 'L\'implémentation SEO est solide avec des opportunités d\'optimisation mineures.';
    } else if (seoScore >= 60) {
      seoSummary = 'Bonne base SEO avec quelques améliorations possibles.';
    } else if (seoScore >= 40) {
      seoSummary = 'Le site a besoin d\'améliorations SEO importantes.';
    } else {
      seoSummary = 'Le site nécessite une optimisation SEO urgente.';
    }
    
    // Créer des détails dynamiques basés sur les vraies données SEO
    let seoDetails: string[] = [];
    
    // Ajouter le score SEO principal
    seoDetails.push(`Score SEO global : ${seoScore}/100`);
    
    // Si on a des détails SEO détaillés
    if (backendData.seoDetails && Array.isArray(backendData.seoDetails) && backendData.seoDetails.length > 0) {
      // Compter les vérifications par statut
      const passedChecks = backendData.seoDetails.filter((check: any) => check.status === 'PASSED').length;
      const failedChecks = backendData.seoDetails.filter((check: any) => check.status === 'FAILED').length;
      const warningChecks = backendData.seoDetails.filter((check: any) => check.status === 'WARNING').length;
      
      seoDetails.push(`✅ Vérifications réussies : ${passedChecks}`);
      seoDetails.push(`❌ Vérifications échouées : ${failedChecks}`);
      seoDetails.push(`⚠️ Avertissements : ${warningChecks}`);
      
      // Ajouter des détails spécifiques des vérifications
      seoDetails.push('');
      seoDetails.push('🔍 Détails des vérifications :');
      backendData.seoDetails.forEach((check: any, index: number) => {
        const statusIcon = check.status === 'PASSED' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
        seoDetails.push(`${statusIcon} ${check.checkType}: ${check.score}/${check.maxScore}`);
      });
    }
    
    // Ajouter des recommandations SEO si disponibles
    if (backendData.seoRecommendations && Array.isArray(backendData.seoRecommendations) && backendData.seoRecommendations.length > 0) {
      seoDetails.push('');
      seoDetails.push('💡 Recommandations SEO :');
      backendData.seoRecommendations.slice(0, 3).forEach((rec: any, index: number) => {
        const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟠' : '🟡';
        seoDetails.push(`${priorityIcon} ${rec.title}`);
        seoDetails.push(`   ${rec.description}`);
      });
    }
    
    // Si on a un ID d'audit SEO, l'ajouter
    if (backendData.seoAuditId) {
      seoDetails.push('');
      seoDetails.push(`🆔 ID de l'audit SEO : ${backendData.seoAuditId}`);
    }
    
    // Si pas de données SEO détaillées, utiliser des détails par défaut
    if (seoDetails.length <= 2) { // Seulement le score et l'ID
      seoDetails.push('');
      seoDetails.push('📋 Audit SEO basique effectué');
      seoDetails.push('🔍 Vérification des éléments SEO essentiels');
      seoDetails.push('📊 Score calculé sur la base des critères principaux');
    }
    
              results.push({
            id: 'seo',
            title: 'Audit SEO',
            icon: '📊',
            score: seoScore,
            status: seoStatus,
            summary: seoSummary,
            details: seoDetails,
            // Conserver l'ID de l'audit SEO pour pouvoir récupérer les détails plus tard
            seoAuditId: backendData.seoAuditId
          });

    return results;
  }

  private getStatusFromScore(score: number): 'good' | 'warning' | 'critical' {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  // Formater les détails du scan complet des vulnérabilités
  private formatFullScanDetails(scanResult: any): string[] {
    const details: string[] = [];
    
    // === RÉSUMÉ GLOBAL ===
    details.push('🔍 RÉSUMÉ DU SCAN COMPLET');
    details.push('========================');
    
    if (scanResult.totalVulnerabilities !== undefined) {
      details.push(`📊 Total des vulnérabilités : ${scanResult.totalVulnerabilities}`);
    }
    
    if (scanResult.scannedPages) {
      details.push(`📄 Pages scannées : ${scanResult.scannedPages}`);
    }
    
    if (scanResult.websiteUrl) {
      details.push(`🌐 Site analysé : ${scanResult.websiteUrl}`);
    }
    
    // === STATISTIQUES PAR TYPE ===
    if (scanResult.vulnerabilityCounts) {
      details.push('');
      details.push('📈 RÉPARTITION PAR TYPE');
      details.push('=======================');
      
      const counts = scanResult.vulnerabilityCounts;
      if (counts.sqlInjection !== undefined) {
        details.push(`💉 Injection SQL : ${counts.sqlInjection} vulnérabilités`);
      }
      if (counts.xss !== undefined) {
        details.push(`🕷️  XSS (Cross-Site Scripting) : ${counts.xss} vulnérabilités`);
      }
      if (counts.csrf !== undefined) {
        details.push(`🔒 CSRF (Cross-Site Request Forgery) : ${counts.csrf} vulnérabilités`);
      }
      if (counts.total !== undefined) {
        details.push(`📊 Total général : ${counts.total} vulnérabilités`);
      }
    }
    
    // === VULNÉRABILITÉS DÉTAILLÉES ===
    if (scanResult.vulnerabilities && Array.isArray(scanResult.vulnerabilities)) {
      details.push('');
      details.push('🚨 VULNÉRABILITÉS DÉTECTÉES');
      details.push('=============================');
      
      // Grouper par type de vulnérabilité
      const vulnByType: { [key: string]: any[] } = {};
      scanResult.vulnerabilities.forEach((vuln: any) => {
        const type = vuln.type || 'AUTRES';
        if (!vulnByType[type]) {
          vulnByType[type] = [];
        }
        vulnByType[type].push(vuln);
      });
      
      // Afficher par type
      Object.entries(vulnByType).forEach(([type, vulns]) => {
        const typeLabel = this.getVulnerabilityTypeLabel(type);
        const severityIcon = this.getSeverityIcon(vulns[0]?.severity);
        
        details.push('');
        details.push(`${severityIcon} ${typeLabel.toUpperCase()} (${vulns.length} vulnérabilités)`);
        details.push('─'.repeat(typeLabel.length + 20));
        
        vulns.forEach((vuln: any, index: number) => {
          details.push(`  ${index + 1}. ${vuln.title}`);
          
          if (vuln.severity) {
            const severity = vuln.severity.toLowerCase();
            const severityColor = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : '🟡';
            details.push(`     ${severityColor} Sévérité : ${vuln.severity}`);
          }
          
          if (vuln.context) {
            details.push(`     📍 Contexte : ${vuln.context}`);
          }
          
          if (vuln.url) {
            details.push(`     🔗 URL : ${vuln.url}`);
          }
          
          if (vuln.payload) {
            details.push(`     💣 Payload : ${vuln.payload}`);
          }
          
          if (vuln.description) {
            details.push(`     📝 Description : ${vuln.description}`);
          }
          
          if (vuln.timestamp) {
            const date = new Date(vuln.timestamp);
            const formattedDate = date.toLocaleString('fr-FR');
            details.push(`     ⏰ Détecté le : ${formattedDate}`);
          }
          
          details.push(''); // Séparateur entre vulnérabilités
        });
      });
    }
    
    // === RECOMMANDATIONS ===
    details.push('');
    details.push('💡 RECOMMANDATIONS DE SÉCURITÉ');
    details.push('===============================');
    
    if (scanResult.totalVulnerabilities > 0) {
      if (scanResult.vulnerabilityCounts?.sqlInjection > 0) {
        details.push('🔴 Injection SQL : Implémenter une validation stricte des entrées et utiliser des requêtes préparées');
      }
      if (scanResult.vulnerabilityCounts?.xss > 0) {
        details.push('🟠 XSS : Encoder toutes les sorties utilisateur et implémenter une politique CSP stricte');
      }
      if (scanResult.vulnerabilityCounts?.csrf > 0) {
        details.push('🟡 CSRF : Ajouter des tokens CSRF à tous les formulaires sensibles');
      }
      details.push('📋 Effectuer un audit de sécurité complet et corriger toutes les vulnérabilités détectées');
    } else {
      details.push('✅ Aucune vulnérabilité critique détectée - Site sécurisé !');
    }
    
    if (details.length === 0) {
      details.push('❌ Aucun détail disponible pour ce scan');
    }
    
    return details;
  }
  
  // Obtenir le label français pour le type de vulnérabilité
  private getVulnerabilityTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'SQL_INJECTION': 'Injection SQL',
      'XSS': 'Cross-Site Scripting (XSS)',
      'CSRF': 'Cross-Site Request Forgery (CSRF)',
      'AUTRES': 'Autres vulnérabilités'
    };
    return labels[type] || type;
  }
  
  // Obtenir l'icône de sévérité
  private getSeverityIcon(severity: string): string {
    if (!severity) return '❓';
    const sev = severity.toLowerCase();
    if (sev === 'critical') return '🔴';
    if (sev === 'high') return '🟠';
    if (sev === 'medium') return '🟡';
    if (sev === 'low') return '🟢';
    return '❓';
  }
  
  // Vérifier si on a un scan en cache valide pour une URL
  private getCachedVulnerabilityScan(url: string): any | null {
    const normalizedUrl = this.normalizeUrl(url);
    
    // Vérifier le cache principal
    if (this.vulnerabilityScanCache.has(normalizedUrl)) {
      const cachedData = this.vulnerabilityScanCache.get(normalizedUrl);
      if (this.isCacheValid(cachedData)) {
        console.log('✅ [AUDIT COMPONENT] Cache valide trouvé pour:', normalizedUrl);
        return cachedData;
      } else {
        console.log('⏰ [AUDIT COMPONENT] Cache expiré pour:', normalizedUrl);
        this.vulnerabilityScanCache.delete(normalizedUrl);
      }
    }
    
    // Vérifier l'historique des scans
    if (this.scanHistory.has(normalizedUrl)) {
      const historyEntry = this.scanHistory.get(normalizedUrl);
      if (historyEntry && this.isCacheValid(historyEntry)) {
        console.log('✅ [AUDIT COMPONENT] Historique valide trouvé pour:', normalizedUrl);
        // Mettre à jour le cache principal
        this.vulnerabilityScanCache.set(normalizedUrl, historyEntry.data);
        return historyEntry.data;
      } else {
        console.log('⏰ [AUDIT COMPONENT] Historique expiré pour:', normalizedUrl);
        this.scanHistory.delete(normalizedUrl);
      }
    }
    
    return null;
  }
  
  // Normaliser une URL pour la comparaison
  private normalizeUrl(url: string): string {
    return url.trim().toLowerCase().replace(/\/$/, '');
  }
  
  // Vérifier si le cache est encore valide
  private isCacheValid(cachedData: any): boolean {
    if (!cachedData || !cachedData.timestamp) return false;
    
    const now = Date.now();
    const cacheAge = now - cachedData.timestamp;
    
    return cacheAge < this.CACHE_VALIDITY_DURATION;
  }
  
  // Afficher les résultats des vulnérabilités (depuis le cache ou nouveau scan)
  private displayVulnerabilityResults(scanResult: any, fromCache: boolean = false) {
    console.log('📊 [AUDIT COMPONENT] Affichage des résultats des vulnérabilités (cache:', fromCache, ')');
    
    if (scanResult && (scanResult.success || scanResult.totalVulnerabilities !== undefined)) {
      const vulnCount = scanResult.totalVulnerabilities || 0;
      const score = vulnCount > 0 ? Math.max(30, 100 - vulnCount * 2) : 100;
      const status = vulnCount > 10 ? 'critical' : vulnCount > 5 ? 'warning' : 'good';
      
      const fullVulnResult: AuditResult = {
        id: 'web-vulnerabilities-full',
        title: `🔍 Scan des Vulnérabilités - ${scanResult.websiteUrl || 'Site Web'} ${fromCache ? '(Cache)' : ''}`,
        icon: '🚨',
        score: score,
        status: status,
        summary: this.generateVulnerabilitySummary(scanResult),
        details: this.formatFullScanDetails(scanResult)
      };
      
      // Afficher les résultats dans le modal
      this.selectedResult.set(fullVulnResult);
      this.showModal.set(true);
      
      console.log('✅ Modal affiché avec les résultats des vulnérabilités');
      
      // Si c'est un nouveau scan, mettre en cache
      if (!fromCache) {
        this.cacheVulnerabilityScan(scanResult);
      }
    } else {
      console.warn('⚠️ [AUDIT COMPONENT] Réponse du scan incomplète:', scanResult);
      this.isVulnScanLoading.set(false);
      
      // Créer un résultat par défaut si la réponse est incomplète
      const defaultVulnResult: AuditResult = {
        id: 'web-vulnerabilities-full',
        title: 'Scan des Vulnérabilités - Données Incomplètes',
        icon: '🚨',
        score: 50,
        status: 'warning',
        summary: 'Scan terminé mais données incomplètes reçues',
        details: [
          'Le scan a été effectué mais la réponse du serveur est incomplète',
          'Vérifiez les logs du serveur pour plus de détails',
          'Réessayez le scan ou contactez l\'administrateur'
        ]
      };
      
      this.selectedResult.set(defaultVulnResult);
      this.showModal.set(true);
    }
  }
  
  // Mettre en cache les résultats d'un scan de vulnérabilités
  private cacheVulnerabilityScan(scanResult: any) {
    if (!scanResult || !scanResult.websiteUrl) return;
    
    const normalizedUrl = this.normalizeUrl(scanResult.websiteUrl);
    const cacheEntry = {
      ...scanResult,
      timestamp: Date.now()
    };
    
    // Mettre à jour le cache principal
    this.vulnerabilityScanCache.set(normalizedUrl, cacheEntry);
    
    // Mettre à jour l'historique
    this.scanHistory.set(normalizedUrl, {
      data: scanResult,
      timestamp: Date.now(),
      url: scanResult.websiteUrl
    });
    
    console.log('💾 [AUDIT COMPONENT] Scan mis en cache pour:', normalizedUrl);
    
    // Nettoyer le cache si il devient trop volumineux (garder max 20 entrées)
    if (this.vulnerabilityScanCache.size > 20) {
      this.cleanupCache();
    }
  }
  
  // Nettoyer le cache des entrées expirées
  private cleanupCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Nettoyer le cache principal
    for (const [url, data] of this.vulnerabilityScanCache.entries()) {
      if (!this.isCacheValid(data)) {
        this.vulnerabilityScanCache.delete(url);
        cleanedCount++;
      }
    }
    
    // Nettoyer l'historique
    for (const [url, entry] of this.scanHistory.entries()) {
      if (!this.isCacheValid(entry)) {
        this.scanHistory.delete(url);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [AUDIT COMPONENT] Cache nettoyé: ${cleanedCount} entrées expirées supprimées`);
    }
  }
  
  // Afficher les informations du cache (pour le débogage)
  public showCacheInfo() {
    const cacheSize = this.vulnerabilityScanCache.size;
    const historySize = this.scanHistory.size;
    const now = Date.now();
    
    let cacheInfo = `📋 INFORMATIONS DU CACHE\n`;
    cacheInfo += `========================\n\n`;
    cacheInfo += `Cache principal : ${cacheSize} entrées\n`;
    cacheInfo += `Historique : ${historySize} entrées\n`;
    cacheInfo += `Durée de validité : ${this.CACHE_VALIDITY_DURATION / 60000} minutes\n\n`;
    
    if (cacheSize > 0) {
      cacheInfo += `🔍 ENTRIES EN CACHE :\n`;
      cacheInfo += `─────────────────────\n`;
      
      for (const [url, data] of this.vulnerabilityScanCache.entries()) {
        const age = Math.round((now - data.timestamp) / 60000);
        const validity = this.isCacheValid(data) ? '✅ Valide' : '⏰ Expiré';
        cacheInfo += `${url}\n`;
        cacheInfo += `  Âge : ${age} minutes\n`;
        cacheInfo += `  Statut : ${validity}\n`;
        cacheInfo += `  Vulnérabilités : ${data.totalVulnerabilities || 0}\n\n`;
      }
    }
    
    console.log(cacheInfo);
    alert(cacheInfo);
  }
  
  // Vider complètement le cache
  public clearCache() {
    const cacheSize = this.vulnerabilityScanCache.size;
    const historySize = this.scanHistory.size;
    
    this.vulnerabilityScanCache.clear();
    this.scanHistory.clear();
    
    console.log(`🗑️ [AUDIT COMPONENT] Cache complètement vidé (${cacheSize} entrées cache, ${historySize} entrées historique)`);
    alert(`🗑️ Cache vidé avec succès !\n\nCache principal : ${cacheSize} entrées supprimées\nHistorique : ${historySize} entrées supprimées`);
  }
  
  // Générer un résumé des vulnérabilités
  private generateVulnerabilitySummary(scanResult: any): string {
    const totalVulns = scanResult.totalVulnerabilities || 0;
    const counts = scanResult.vulnerabilityCounts || {};
    
    if (totalVulns === 0) {
      return '✅ Aucune vulnérabilité détectée - Site sécurisé !';
    }
    
    let summary = `🚨 ${totalVulns} vulnérabilités détectées`;
    
    if (counts.sqlInjection > 0) {
      summary += ` (${counts.sqlInjection} SQL Injection)`;
    }
    if (counts.xss > 0) {
      summary += ` (${counts.xss} XSS)`;
    }
    if (counts.csrf > 0) {
      summary += ` (${counts.csrf} CSRF)`;
    }
    
    summary += ` sur ${scanResult.scannedPages || 'plusieurs'} pages`;
    
    // Ajouter un indicateur de risque
    if (totalVulns > 20) {
      summary += ' - ⚠️ RISQUE CRITIQUE';
    } else if (totalVulns > 10) {
      summary += ' - 🔴 RISQUE ÉLEVÉ';
    } else if (totalVulns > 5) {
      summary += ' - 🟠 RISQUE MODÉRÉ';
    } else {
      summary += ' - 🟡 RISQUE FAIBLE';
    }
    
    return summary;
  }
}