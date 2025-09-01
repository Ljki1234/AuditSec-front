import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

interface Site {
  id: number;
  nom: string;
  url: string;
  statut: 'actif' | 'inactif' | 'erreur';
  dernierAudit: string;
  scoreSecurite: number;
  vulnerabilites: number;
  alertes: number;
  certificatSSL: {
    valide: boolean;
    expiration: string;
  };
  technologies: string[];
}

@Component({
  selector: 'app-liste-sites',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="sites-container fade-in">
      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Sites</h1>
          <p>{{ summary?.total ?? sites.length }} sites surveillés • {{ summary?.active ?? getSitesActifs() }} actifs</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="exporterSites()">
            <span>📁</span>
            Exporter
          </button>
          <div class="quick-audit">
            <input type="text" class="quick-input" placeholder="Entrer une URL (ex: https://github.com)" [(ngModel)]="urlSaisie">
            <button class="btn btn-primary" (click)="ajouterEtAuditer()">
              <span>🔍</span>
              Auditer
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-bar">
          <div class="search-input">
            <span class="search-icon">🔍</span>
            <input type="text" 
                   placeholder="Rechercher un site..." 
                   [(ngModel)]="filtres.recherche"
                   (input)="appliquerFiltres()">
          </div>
        </div>
        
        <div class="filter-controls">
          <select class="filter-select" [(ngModel)]="filtres.statut" (change)="appliquerFiltres()">
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
            <option value="erreur">En erreur</option>
          </select>
          
          <select class="filter-select" [(ngModel)]="filtres.scoreMin" (change)="appliquerFiltres()">
            <option value="">Score minimum</option>
            <option value="80">80+</option>
            <option value="60">60+</option>
            <option value="40">40+</option>
            <option value="20">20+</option>
          </select>

          <button class="btn btn-secondary" (click)="reinitialiserFiltres()">
            <span>🔄</span>
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Vue en grille/liste -->
      <div class="view-controls">
        <div class="view-toggle">
          <button class="toggle-btn" 
                  [class.active]="vueMode === 'grille'"
                  (click)="vueMode = 'grille'">
            <span>⊞</span>
          </button>
          <button class="toggle-btn" 
                  [class.active]="vueMode === 'liste'"
                  (click)="vueMode = 'liste'">
            <span>☰</span>
          </button>
        </div>
        
        <div class="results-info">
          {{ sitesFiltres.length }} résultat{{ sitesFiltres.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Vue grille -->
      <div class="sites-grid" *ngIf="vueMode === 'grille'">
        <div class="site-card" *ngFor="let site of sitesFiltres; trackBy: trackBySiteId">
          <div class="site-header">
            <div class="site-info">
              <h3 class="site-name">{{ site.nom }}</h3>
              <p class="site-url">{{ site.url }}</p>
            </div>
            <div class="site-status">
              <span class="badge" [class]="'badge-' + getStatusColor(site.statut)">
                {{ getStatusLabel(site.statut) }}
              </span>
            </div>
          </div>

          <div class="site-metrics">
            <div class="metric">
              <div class="metric-label">Score sécurité</div>
              <div class="metric-value" [class]="getScoreClass(site.scoreSecurite)">
                {{ site.scoreSecurite }}%
              </div>
            </div>
            <div class="metric">
              <div class="metric-label">Vulnérabilités</div>
              <div class="metric-value" [class]="site.vulnerabilites > 0 ? 'text-danger' : 'text-success'">
                {{ site.vulnerabilites }}
              </div>
            </div>
            <div class="metric">
              <div class="metric-label">Alertes</div>
              <div class="metric-value" [class]="site.alertes > 0 ? 'text-warning' : 'text-muted'">
                {{ site.alertes }}
              </div>
            </div>
          </div>

          <div class="site-details">
            <div class="detail-row">
              <span class="detail-label">Dernier audit:</span>
              <span class="detail-value">{{ site.dernierAudit }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">SSL:</span>
              <span class="badge" [class]="site.certificatSSL.valide ? 'badge-success' : 'badge-danger'">
                {{ site.certificatSSL.valide ? 'Valide' : 'Expiré' }}
              </span>
            </div>
          </div>

          <div class="site-technologies">
            <span class="tech-tag" *ngFor="let tech of site.technologies.slice(0, 3)">
              {{ tech }}
            </span>
            <span class="tech-more" *ngIf="site.technologies.length > 3">
              +{{ site.technologies.length - 3 }}
            </span>
          </div>

          <div class="site-actions">
            <a [routerLink]="['/sites', site.id]" class="btn btn-secondary btn-sm">
              <span>👁️</span>
              Voir
            </a>
            <button class="btn btn-primary btn-sm" (click)="lancerAudit(site)">
              <span>🔍</span>
              Auditer
            </button>
            <button class="btn-icon" (click)="editerSite(site)">
              <span>✏️</span>
            </button>
            <button class="btn-icon btn-danger" (click)="supprimerSite(site)">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Vue liste -->
      <div class="sites-table-container" *ngIf="vueMode === 'liste'">
        <table class="table">
          <thead>
            <tr>
              <th (click)="trierPar('nom')" class="sortable">
                Nom du site
                <span class="sort-indicator" [class]="getSortClass('nom')">↕️</span>
              </th>
              <th>URL</th>
              <th (click)="trierPar('statut')" class="sortable">
                Statut
                <span class="sort-indicator" [class]="getSortClass('statut')">↕️</span>
              </th>
              <th (click)="trierPar('scoreSecurite')" class="sortable">
                Score
                <span class="sort-indicator" [class]="getSortClass('scoreSecurite')">↕️</span>
              </th>
              <th>Vulnérabilités</th>
              <th>SSL</th>
              <th (click)="trierPar('dernierAudit')" class="sortable">
                Dernier audit
                <span class="sort-indicator" [class]="getSortClass('dernierAudit')">↕️</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let site of sitesFiltres; trackBy: trackBySiteId">
              <td>
                <div class="site-cell">
                  <strong>{{ site.nom }}</strong>
                  <div class="site-technologies-inline">
                    <span class="tech-tag-small" *ngFor="let tech of site.technologies.slice(0, 2)">
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <a [href]="site.url" target="_blank" class="site-link">
                  {{ site.url }}
                  <span>🔗</span>
                </a>
              </td>
              <td>
                <span class="badge" [class]="'badge-' + getStatusColor(site.statut)">
                  {{ getStatusLabel(site.statut) }}
                </span>
              </td>
              <td>
                <div class="score-cell">
                  <span class="score-value" [class]="getScoreClass(site.scoreSecurite)">
                    {{ site.scoreSecurite }}%
                  </span>
                  <div class="score-bar">
                    <div class="score-fill" 
                         [style.width.%]="site.scoreSecurite"
                         [class]="getScoreClass(site.scoreSecurite)"></div>
                  </div>
                </div>
              </td>
              <td>
                <span class="vulnerability-count" [class]="site.vulnerabilites > 0 ? 'has-vulnerabilities' : ''">
                  {{ site.vulnerabilites }}
                  <span *ngIf="site.alertes > 0" class="alert-indicator">⚠️</span>
                </span>
              </td>
              <td>
                <span class="badge badge-sm" [class]="site.certificatSSL.valide ? 'badge-success' : 'badge-danger'">
                  {{ site.certificatSSL.valide ? 'Valide' : 'Expiré' }}
                </span>
              </td>
              <td>{{ site.dernierAudit }}</td>
              <td>
                <div class="table-actions">
                  <a [routerLink]="['/sites', site.id]" class="btn-icon" title="Voir les détails">
                    <span>👁️</span>
                  </a>
                  <button class="btn-icon" (click)="lancerAudit(site)" title="Lancer un audit">
                    <span>🔍</span>
                  </button>
                  <button class="btn-icon" (click)="editerSite(site)" title="Modifier">
                    <span>✏️</span>
                  </button>
                  <button class="btn-icon btn-danger" (click)="supprimerSite(site)" title="Supprimer">
                    <span>🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div class="empty-state" *ngIf="sitesFiltres.length === 0">
        <div class="empty-icon">🌐</div>
        <h3>Aucun site trouvé</h3>
        <p *ngIf="filtres.recherche || filtres.statut || filtres.scoreMin">
          Aucun site ne correspond à vos critères de recherche.
        </p>
        <p *ngIf="!filtres.recherche && !filtres.statut && !filtres.scoreMin">
          Commencez par ajouter votre premier site à surveiller.
        </p>
        <a routerLink="/sites/ajouter" class="btn btn-primary" *ngIf="sites.length === 0">
          <span>➕</span>
          Ajouter un site
        </a>
        <button class="btn btn-secondary" (click)="reinitialiserFiltres()" *ngIf="sites.length > 0">
          <span>🔄</span>
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sites-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-left h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .header-left p {
      color: var(--text-secondary);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .quick-audit { display: flex; gap: 0.5rem; }
    .quick-input {
      width: 360px;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .filters-section {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .search-bar {
      flex: 1;
    }

    .search-input {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .search-input input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .search-input input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.875rem;
      cursor: pointer;
    }

    .view-controls {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .view-toggle {
      display: flex;
      background-color: var(--bg-primary);
      border-radius: 0.5rem;
      padding: 0.25rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .toggle-btn {
      background: none;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      background-color: var(--bg-secondary);
    }

    .toggle-btn.active {
      background-color: var(--primary-color);
      color: white;
    }

    .results-info {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* Vue grille */
    .sites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .site-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }

    .site-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .site-header {
      display: flex;
      justify-content: between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .site-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }

    .site-url {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .site-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .metric {
      text-align: center;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .text-success { color: var(--success-color); }
    .text-warning { color: var(--warning-color); }
    .text-danger { color: var(--error-color); }
    .text-muted { color: var(--text-muted); }

    .site-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .detail-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .detail-value {
      font-size: 0.875rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .site-technologies {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .tech-tag {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      border: 1px solid var(--border-color);
    }

    .tech-more {
      background-color: var(--primary-light);
      color: var(--primary-color);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .site-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-icon {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .btn-icon:hover {
      background-color: var(--bg-secondary);
    }

    .btn-icon.btn-danger {
      border-color: var(--error-color);
      color: var(--error-color);
    }

    .btn-icon.btn-danger:hover {
      background-color: var(--error-color);
      color: white;
    }

    /* Vue liste */
    .sites-table-container {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      background-color: var(--bg-secondary);
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
      border-bottom: 1px solid var(--border-color);
    }

    .table th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
      transition: background-color 0.2s ease;
    }

    .table th.sortable:hover {
      background-color: var(--bg-tertiary);
    }

    .sort-indicator {
      margin-left: 0.5rem;
      opacity: 0.5;
      font-size: 0.75rem;
    }

    .sort-indicator.asc {
      opacity: 1;
    }

    .sort-indicator.desc {
      opacity: 1;
      transform: rotate(180deg);
    }

    .table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.875rem;
    }

    .site-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .site-technologies-inline {
      display: flex;
      gap: 0.25rem;
    }

    .tech-tag-small {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.625rem;
      border: 1px solid var(--border-color);
    }

    .site-link {
      color: var(--text-secondary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s ease;
    }

    .site-link:hover {
      color: var(--primary-color);
    }

    .score-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .score-value {
      font-weight: 600;
    }

    .score-bar {
      width: 60px;
      height: 4px;
      background-color: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .score-fill.text-success {
      background-color: var(--success-color);
    }

    .score-fill.text-warning {
      background-color: var(--warning-color);
    }

    .score-fill.text-danger {
      background-color: var(--error-color);
    }

    .vulnerability-count {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .vulnerability-count.has-vulnerabilities {
      color: var(--error-color);
      font-weight: 600;
    }

    .alert-indicator {
      font-size: 0.75rem;
    }

    .badge-sm {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
    }

    .table-actions {
      display: flex;
      gap: 0.25rem;
    }

    /* État vide */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--text-primary);
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .filters-section {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filter-controls {
        flex-wrap: wrap;
      }

      .view-controls {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .sites-grid {
        grid-template-columns: 1fr;
      }

      .site-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .sites-table-container {
        overflow-x: auto;
      }

      .table {
        min-width: 800px;
      }
    }
  `]
})
export class ListeSitesComponent implements OnInit {
  vueMode: 'grille' | 'liste' = 'grille';
  
  filtres = {
    recherche: '',
    statut: '',
    scoreMin: ''
  };

  triActuel = {
    colonne: '',
    direction: 'asc' as 'asc' | 'desc'
  };

  summary: { total?: number; active?: number } | null = null;
  urlSaisie = '';
  sites: Site[] = [];
  sitesFiltres: Site[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.chargerSummary();
    this.chargerListe();
  }

  trackBySiteId(index: number, site: Site): number {
    return site.id;
  }

  getSitesActifs(): number {
    return this.sites.filter(site => site.statut === 'actif').length;
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'erreur': 'Erreur'
    };
    return labels[statut] || statut;
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'actif': 'success',
      'inactif': 'warning',
      'erreur': 'danger'
    };
    return colors[statut] || 'secondary';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }

  appliquerFiltres() {
    this.sitesFiltres = this.sites.filter(site => {
      const rechercheMatch = !this.filtres.recherche || 
        site.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        site.url.toLowerCase().includes(this.filtres.recherche.toLowerCase());
      
      const statutMatch = !this.filtres.statut || site.statut === this.filtres.statut;
      
      const scoreMatch = !this.filtres.scoreMin || site.scoreSecurite >= parseInt(this.filtres.scoreMin);
      
      return rechercheMatch && statutMatch && scoreMatch;
    });

    // Réappliquer le tri si nécessaire
    if (this.triActuel.colonne) {
      this.appliquerTri();
    }
  }

  reinitialiserFiltres() {
    this.filtres = {
      recherche: '',
      statut: '',
      scoreMin: ''
    };
    this.appliquerFiltres();
  }

  trierPar(colonne: string) {
    if (this.triActuel.colonne === colonne) {
      this.triActuel.direction = this.triActuel.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.triActuel.colonne = colonne;
      this.triActuel.direction = 'asc';
    }
    this.appliquerTri();
  }

  appliquerTri() {
    this.sitesFiltres.sort((a: any, b: any) => {
      const aVal = a[this.triActuel.colonne];
      const bVal = b[this.triActuel.colonne];
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;
      
      return this.triActuel.direction === 'desc' ? -comparison : comparison;
    });
  }

  getSortClass(colonne: string): string {
    if (this.triActuel.colonne !== colonne) return '';
    return this.triActuel.direction;
  }

  lancerAudit(site: Site) {
    this.http.get(`/api/audits/launch/${site.id}`).subscribe({
      next: (auditResult: any) => {
        const vulns = auditResult?.vulnerabilitiesCount || 0;
        const alerts = auditResult?.alertsCount || 0;
        alert(`Audit terminé!\nVulnérabilités détectées: ${vulns}\nAlertes non lues: ${alerts}`);
        this.chargerListe();
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || "Erreur lors du lancement de l'audit";
        alert(msg);
      }
    });
  }

  editerSite(site: Site) {
    console.log('Démonstration: Éditer site', site.nom);
  }

  supprimerSite(site: Site) {
    const message = `🗑️ Êtes-vous sûr de vouloir supprimer le site "${site.nom}" ?\n\n⚠️ ATTENTION : Cette action supprimera définitivement :\n• Le site web\n• Tous les audits associés\n• Tous les résultats d'audit\n• Toutes les vulnérabilités détectées\n• Toutes les notifications liées\n\nCette action est irréversible !`;
    
    if (confirm(message)) {
      // Afficher un indicateur de chargement
      const originalText = '🗑️';
      const deleteButton = event?.target as HTMLElement;
      if (deleteButton) {
        deleteButton.innerHTML = '⏳';
        deleteButton.setAttribute('disabled', 'true');
      }
      
      this.http.delete(`/api/websites/${site.id}`).subscribe({
        next: () => {
          // Supprimer le site de la liste locale
          this.sites = this.sites.filter(s => s.id !== site.id);
          this.appliquerFiltres();
          
          // Message de succès détaillé
          const successMsg = `✅ Site "${site.nom}" supprimé avec succès !\n\n🗑️ Supprimé en cascade :\n• Site web\n• ${site.vulnerabilites} vulnérabilités\n• ${site.alertes} notifications\n• Tous les audits associés`;
          alert(successMsg);
          
          // Rafraîchir les données depuis le backend
          this.chargerSummary();
          this.chargerListe();
        },
        error: (err) => {
          const msg = err?.error?.error || err?.error || "Erreur lors de la suppression du site";
          alert(`❌ Erreur de suppression : ${msg}`);
        },
        complete: () => {
          // Restaurer le bouton
          if (deleteButton) {
            deleteButton.innerHTML = originalText;
            deleteButton.removeAttribute('disabled');
          }
        }
      });
    }
  }

  exporterSites() {
    let params = new HttpParams();
    if (this.filtres.recherche) params = params.set('q', this.filtres.recherche);
    if (this.filtres.statut) params = params.set('status', this.mapStatutLabel(this.filtres.statut));
    if (this.filtres.scoreMin) params = params.set('minScore', this.filtres.scoreMin);
    this.http.get(`/api/websites/export`, { params, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'websites.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || "Erreur lors de l'export CSV";
        alert(msg);
      }
    });
  }

  ajouterEtAuditer() {
    const url = (this.urlSaisie || '').trim();
    if (!url) { alert('Veuillez entrer une URL'); return; }
    const body: any = { url, name: this.extraireNom(url) };
    this.http.post<any>('/api/websites', body).subscribe({
      next: (created) => {
        const siteId = created?.id;
        if (!siteId) { this.chargerSummary(); this.chargerListe(); return; }
        this.http.get(`/api/audits/launch/${siteId}`).subscribe({
          next: (auditResult: any) => {
            const vulns = auditResult?.vulnerabilitiesCount || 0;
            const alerts = auditResult?.alertsCount || 0;
            alert(`Site créé et audité!\nVulnérabilités détectées: ${vulns}\nAlertes non lues: ${alerts}`);
            this.urlSaisie = '';
            this.chargerSummary();
            this.chargerListe();
          },
          error: (err) => {
            const msg = err?.error?.error || err?.error || "Erreur lors du lancement de l'audit";
            alert(msg);
            this.chargerSummary();
            this.chargerListe();
          }
        });
      },
      error: (err) => {
        const msg = err?.error?.error || err?.error || "Impossible d'ajouter le site";
        alert(msg);
      }
    });
  }

  private chargerSummary() {
    this.http.get<any>('/api/websites/summary').subscribe({
      next: (s) => this.summary = s,
      error: () => this.summary = null
    });
  }

  private chargerListe() {
    let params = new HttpParams().set('page', '0').set('size', '50');
    if (this.filtres.recherche) params = params.set('q', this.filtres.recherche);
    if (this.filtres.statut) params = params.set('status', this.mapStatutLabel(this.filtres.statut));
    if (this.filtres.scoreMin) params = params.set('minScore', this.filtres.scoreMin);

    this.http.get<any>('/api/websites/list', { params }).subscribe({
      next: (page) => {
        const items = (page?.content ?? []) as any[];
        this.sites = items.map(it => this.mapItemToViewModel(it));
        this.appliquerFiltres();
      },
      error: () => {
        this.sites = [];
        this.sitesFiltres = [];
      }
    });
  }

  private mapItemToViewModel(item: any): Site {
    const statut = this.mapStatusFromApi(item.status);
    return {
      id: item.id,
      nom: item.name ?? item.url,
      url: item.url,
      statut,
      dernierAudit: item.lastAuditAt ? this.formatDate(item.lastAuditAt) : '-',
      scoreSecurite: item.securityScore ?? 0,
      vulnerabilites: item.vulnerabilitiesCount ?? 0,
      alertes: item.alertsCount ?? 0,
      certificatSSL: { valide: !!item.sslValid, expiration: '-' },
      technologies: item.techStack ?? []
    };
  }

  private mapStatusFromApi(status?: string): 'actif' | 'inactif' | 'erreur' {
    const s = (status || '').toLowerCase();
    if (s === 'actif') return 'actif';
    if (s === 'inactif') return 'inactif';
    if (s === 'erreur') return 'erreur';
    // tolère EN/legacy
    if (s === 'active') return 'actif';
    if (s === 'inactive') return 'inactif';
    if (s === 'error') return 'erreur';
    return 'actif';
  }

  private mapStatutLabel(statut?: string): string {
    if (!statut) return '';
    if (statut === 'actif') return 'Actif';
    if (statut === 'inactif') return 'Inactif';
    if (statut === 'erreur') return 'Erreur';
    return '';
  }

  private formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  private extraireNom(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url;
    }
  }
}