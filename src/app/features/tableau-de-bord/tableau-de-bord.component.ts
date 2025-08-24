import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteStatistiqueComponent } from '../../shared/components/carte-statistique/carte-statistique.component';
import { GraphiqueSimpleComponent } from '../../shared/components/graphique-simple/graphique-simple.component';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, CarteStatistiqueComponent, GraphiqueSimpleComponent],
  template: `
    <div class="dashboard fade-in">
      <!-- Cartes de statistiques -->
      <section class="stats-section">
        <div class="grid grid-cols-4">
          <app-carte-statistique
            titre="Sites Surveillés"
            valeur="24"
            icone="🌐"
            couleur="primary"
            [changement]="8">
          </app-carte-statistique>
          
          <app-carte-statistique
            titre="Audits Réalisés"
            valeur="156"
            icone="🔍"
            couleur="success"
            [changement]="12">
          </app-carte-statistique>
          
          <app-carte-statistique
            titre="Vulnérabilités"
            valeur="7"
            icone="⚠️"
            couleur="warning"
            [changement]="-15">
          </app-carte-statistique>
          
          <app-carte-statistique
            titre="Alertes Critiques"
            valeur="3"
            icone="🚨"
            couleur="danger"
            [changement]="0">
          </app-carte-statistique>
        </div>
      </section>

      <!-- Graphiques -->
      <section class="charts-section">
        <div class="grid grid-cols-2">
          <app-graphique-simple
            titre="Audits par Mois"
            [donnees]="donneesAuditsParMois"
            type="barres">
          </app-graphique-simple>

          <app-graphique-simple
            titre="Types de Vulnérabilités"
            [donnees]="donneesVulnerabilites"
            type="circulaire">
          </app-graphique-simple>
        </div>
      </section>

      <!-- Évolution temporelle -->
      <section class="timeline-section">
        <app-graphique-simple
          titre="Évolution des Scores de Sécurité"
          [donnees]="donneesEvolution"
          type="ligne">
        </app-graphique-simple>
      </section>

      <!-- Activité récente -->
      <section class="activity-section">
        <div class="grid grid-cols-2">
          <!-- Derniers audits -->
          <div class="card">
            <div class="card-header">
              <h3>Derniers Audits</h3>
            </div>
            <div class="card-body">
              <div class="activity-list">
                <div class="activity-item" *ngFor="let audit of derniersAudits">
                  <div class="activity-icon" [class]="'activity-icon-' + audit.statut">
                    {{ audit.icone }}
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ audit.site }}</div>
                    <div class="activity-meta">{{ audit.date }} • {{ audit.duree }}</div>
                  </div>
                  <div class="activity-badge">
                    <span class="badge" [class]="'badge-' + audit.statut">{{ audit.resultat }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sites critiques -->
          <div class="card">
            <div class="card-header">
              <h3>Sites Nécessitant une Attention</h3>
            </div>
            <div class="card-body">
              <div class="critical-sites">
                <div class="critical-site" *ngFor="let site of sitesCritiques">
                  <div class="site-info">
                    <div class="site-name">{{ site.nom }}</div>
                    <div class="site-url">{{ site.url }}</div>
                  </div>
                  <div class="site-risk">
                    <span class="badge" [class]="'badge-' + site.niveau">{{ site.niveau }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-section,
    .charts-section,
    .timeline-section,
    .activity-section {
      margin-bottom: 1rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background-color: var(--bg-secondary);
      transition: background-color 0.2s ease;
    }

    .activity-item:hover {
      background-color: var(--bg-tertiary);
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .activity-icon-success {
      background-color: #dcfce7;
      color: var(--success-color);
    }

    .activity-icon-warning {
      background-color: #fef3c7;
      color: var(--warning-color);
    }

    .activity-icon-danger {
      background-color: #fecaca;
      color: var(--error-color);
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .activity-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .activity-badge {
      display: flex;
      align-items: center;
    }

    .critical-sites {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .critical-site {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--bg-secondary);
    }

    .site-info {
      flex: 1;
    }

    .site-name {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .site-url {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .site-risk {
      margin-left: 1rem;
    }
  `]
})
export class TableauDeBordComponent {
  donneesAuditsParMois = [
    { label: 'Jan', valeur: 45 },
    { label: 'Fév', valeur: 52 },
    { label: 'Mar', valeur: 38 },
    { label: 'Avr', valeur: 61 },
    { label: 'Mai', valeur: 55 },
    { label: 'Jun', valeur: 67 }
  ];

  donneesVulnerabilites = [
    { label: 'XSS', valeur: 12, couleur: '#ef4444' },
    { label: 'SQL Injection', valeur: 8, couleur: '#f97316' },
    { label: 'CSRF', valeur: 5, couleur: '#eab308' },
    { label: 'Headers', valeur: 15, couleur: '#3b82f6' },
    { label: 'Autres', valeur: 7, couleur: '#64748b' }
  ];

  donneesEvolution = [
    { label: 'S1', valeur: 75 },
    { label: 'S2', valeur: 82 },
    { label: 'S3', valeur: 78 },
    { label: 'S4', valeur: 85 },
    { label: 'S5', valeur: 88 },
    { label: 'S6', valeur: 92 }
  ];

  derniersAudits = [
    {
      site: 'exemple.com',
      date: '15 Jan 2025',
      duree: '2h 15min',
      resultat: 'Terminé',
      statut: 'success',
      icone: '✅'
    },
    {
      site: 'boutique.fr',
      date: '14 Jan 2025',
      duree: '1h 45min',
      resultat: 'Vulnérabilités',
      statut: 'warning',
      icone: '⚠️'
    },
    {
      site: 'webapp.net',
      date: '13 Jan 2025',
      duree: '3h 20min',
      resultat: 'Critique',
      statut: 'danger',
      icone: '🚨'
    }
  ];

  sitesCritiques = [
    {
      nom: 'E-commerce Principal',
      url: 'boutique.exemple.com',
      niveau: 'danger'
    },
    {
      nom: 'API Services',
      url: 'api.services.fr',
      niveau: 'warning'
    },
    {
      nom: 'Blog Corporate',
      url: 'blog.entreprise.com',
      niveau: 'warning'
    }
  ];
}