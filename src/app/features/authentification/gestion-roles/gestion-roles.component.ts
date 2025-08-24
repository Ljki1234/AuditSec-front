import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Role {
  id: number;
  nom: string;
  description: string;
  permissions: string[];
  utilisateurs: number;
  couleur: string;
  actif: boolean;
}

interface Permission {
  id: string;
  nom: string;
  description: string;
  categorie: string;
}

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="roles-container fade-in">
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Rôles</h1>
          <p>Configurez les rôles et permissions de votre organisation</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span>➕</span>
            Nouveau rôle
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ roles.length }}</div>
            <div class="stat-label">Rôles configurés</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ getActiveRoles() }}</div>
            <div class="stat-label">Rôles actifs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔑</div>
          <div class="stat-content">
            <div class="stat-value">{{ permissions.length }}</div>
            <div class="stat-label">Permissions disponibles</div>
          </div>
        </div>
      </div>

      <!-- Liste des rôles -->
      <div class="roles-grid">
        <div class="role-card" *ngFor="let role of roles; trackBy: trackByRoleId" [class.inactive]="!role.actif">
          <div class="role-header">
            <div class="role-info">
              <div class="role-color" [style.background-color]="role.couleur"></div>
              <div>
                <h3 class="role-name">{{ role.nom }}</h3>
                <p class="role-description">{{ role.description }}</p>
              </div>
            </div>
            <div class="role-actions">
              <div class="role-toggle">
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="role.actif" (change)="toggleRole(role)">
                  <span class="slider"></span>
                </label>
              </div>
              <button class="btn-icon" (click)="editRole(role)" title="Modifier">
                <span>✏️</span>
              </button>
              <button class="btn-icon btn-danger" (click)="deleteRole(role)" title="Supprimer">
                <span>🗑️</span>
              </button>
            </div>
          </div>

          <div class="role-stats">
            <div class="role-stat">
              <span class="stat-number">{{ role.permissions.length }}</span>
              <span class="stat-text">permissions</span>
            </div>
            <div class="role-stat">
              <span class="stat-number">{{ role.utilisateurs }}</span>
              <span class="stat-text">utilisateurs</span>
            </div>
          </div>

          <div class="role-permissions">
            <div class="permissions-header">
              <span>Permissions attribuées:</span>
            </div>
            <div class="permissions-list">
              <span class="permission-tag" *ngFor="let permission of role.permissions.slice(0, 3)">
                {{ getPermissionName(permission) }}
              </span>
              <span class="permission-more" *ngIf="role.permissions.length > 3">
                +{{ role.permissions.length - 3 }} autres
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de création/édition -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier le rôle' : 'Nouveau rôle' }}</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <form (ngSubmit)="saveRole()" #roleForm="ngForm">
              <div class="form-group">
                <label for="roleName" class="form-label">Nom du rôle</label>
                <input type="text" id="roleName" class="form-control"
                       [(ngModel)]="currentRole.nom" name="roleName" required
                       placeholder="Ex: Administrateur, Auditeur...">
              </div>

              <div class="form-group">
                <label for="roleDescription" class="form-label">Description</label>
                <textarea id="roleDescription" class="form-control" rows="3"
                          [(ngModel)]="currentRole.description" name="roleDescription"
                          placeholder="Décrivez les responsabilités de ce rôle..."></textarea>
              </div>

              <div class="form-group">
                <label for="roleColor" class="form-label">Couleur</label>
                <div class="color-picker">
                  <input type="color" id="roleColor" class="color-input"
                         [(ngModel)]="currentRole.couleur" name="roleColor">
                  <span class="color-preview" [style.background-color]="currentRole.couleur"></span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Permissions</label>
                <div class="permissions-grid">
                  <div class="permission-category" *ngFor="let category of getPermissionCategories()">
                    <h4 class="category-title">{{ category }}</h4>
                    <div class="permission-checkboxes">
                      <label class="checkbox-label" *ngFor="let permission of getPermissionsByCategory(category)">
                        <input type="checkbox" 
                               [checked]="isPermissionSelected(permission.id)"
                               (change)="togglePermission(permission.id)">
                        <span class="checkmark"></span>
                        <div class="permission-info">
                          <div class="permission-name">{{ permission.nom }}</div>
                          <div class="permission-desc">{{ permission.description }}</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="roleForm.invalid">
                  {{ isEditing ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      max-width: 1200px;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      width: 56px;
      height: 56px;
      background-color: var(--primary-light);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .role-card {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }

    .role-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .role-card.inactive {
      opacity: 0.6;
    }

    .role-header {
      display: flex;
      justify-content: between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .role-info {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      flex: 1;
    }

    .role-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .role-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }

    .role-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .role-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .role-toggle {
      margin-right: 0.5rem;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--bg-tertiary);
      transition: 0.3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: var(--shadow);
    }

    input:checked + .slider {
      background-color: var(--success-color);
    }

    input:checked + .slider:before {
      transform: translateX(20px);
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

    .role-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .role-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-number {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stat-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .permissions-header {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-tag {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      border: 1px solid var(--border-color);
    }

    .permission-more {
      background-color: var(--primary-light);
      color: var(--primary-color);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }

    .modal-header {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .color-input {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--border-color);
    }

    .permissions-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .permission-category {
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .category-title {
      background-color: var(--bg-secondary);
      padding: 0.75rem 1rem;
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }

    .permission-checkboxes {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .permission-info {
      flex: 1;
    }

    .permission-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .permission-desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .role-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .role-actions {
        justify-content: between;
      }
    }
  `]
})
export class GestionRolesComponent {
  showModal = false;
  isEditing = false;
  currentRole: Partial<Role> = {};

  roles: Role[] = [
    {
      id: 1,
      nom: 'Super Administrateur',
      description: 'Accès complet à toutes les fonctionnalités de la plateforme',
      permissions: ['admin.all', 'sites.all', 'audits.all', 'users.all'],
      utilisateurs: 2,
      couleur: '#ef4444',
      actif: true
    },
    {
      id: 2,
      nom: 'Administrateur',
      description: 'Gestion des sites et audits, administration limitée',
      permissions: ['sites.all', 'audits.all', 'users.read', 'reports.all'],
      utilisateurs: 5,
      couleur: '#3b82f6',
      actif: true
    },
    {
      id: 3,
      nom: 'Auditeur Senior',
      description: 'Création et gestion complète des audits de sécurité',
      permissions: ['sites.read', 'audits.all', 'reports.create'],
      utilisateurs: 8,
      couleur: '#10b981',
      actif: true
    },
    {
      id: 4,
      nom: 'Auditeur Junior',
      description: 'Lancement d\'audits et consultation des rapports',
      permissions: ['sites.read', 'audits.create', 'audits.read'],
      utilisateurs: 12,
      couleur: '#f59e0b',
      actif: true
    },
    {
      id: 5,
      nom: 'Observateur',
      description: 'Consultation uniquement des rapports et statistiques',
      permissions: ['sites.read', 'audits.read', 'reports.read'],
      utilisateurs: 25,
      couleur: '#64748b',
      actif: false
    }
  ];

  permissions: Permission[] = [
    // Administration
    { id: 'admin.all', nom: 'Administration complète', description: 'Toutes les fonctions d\'administration', categorie: 'Administration' },
    { id: 'users.all', nom: 'Gestion utilisateurs', description: 'Créer, modifier, supprimer les utilisateurs', categorie: 'Administration' },
    { id: 'users.read', nom: 'Consultation utilisateurs', description: 'Voir la liste des utilisateurs', categorie: 'Administration' },
    { id: 'roles.all', nom: 'Gestion des rôles', description: 'Créer et modifier les rôles', categorie: 'Administration' },
    
    // Sites
    { id: 'sites.all', nom: 'Gestion complète sites', description: 'Toutes les actions sur les sites', categorie: 'Sites' },
    { id: 'sites.create', nom: 'Ajouter des sites', description: 'Ajouter de nouveaux sites à surveiller', categorie: 'Sites' },
    { id: 'sites.read', nom: 'Consulter les sites', description: 'Voir la liste et détails des sites', categorie: 'Sites' },
    { id: 'sites.edit', nom: 'Modifier les sites', description: 'Modifier les paramètres des sites', categorie: 'Sites' },
    { id: 'sites.delete', nom: 'Supprimer les sites', description: 'Supprimer des sites', categorie: 'Sites' },
    
    // Audits
    { id: 'audits.all', nom: 'Gestion complète audits', description: 'Toutes les actions sur les audits', categorie: 'Audits' },
    { id: 'audits.create', nom: 'Lancer des audits', description: 'Démarrer de nouveaux audits', categorie: 'Audits' },
    { id: 'audits.read', nom: 'Consulter les audits', description: 'Voir les résultats d\'audits', categorie: 'Audits' },
    { id: 'audits.schedule', nom: 'Planifier des audits', description: 'Programmer des audits récurrents', categorie: 'Audits' },
    
    // Rapports
    { id: 'reports.all', nom: 'Gestion complète rapports', description: 'Toutes les actions sur les rapports', categorie: 'Rapports' },
    { id: 'reports.create', nom: 'Générer des rapports', description: 'Créer et personnaliser les rapports', categorie: 'Rapports' },
    { id: 'reports.read', nom: 'Consulter les rapports', description: 'Voir les rapports existants', categorie: 'Rapports' },
    { id: 'reports.export', nom: 'Exporter les rapports', description: 'Télécharger les rapports en PDF/CSV', categorie: 'Rapports' }
  ];

  trackByRoleId(index: number, role: Role): number {
    return role.id;
  }

  getActiveRoles(): number {
    return this.roles.filter(role => role.actif).length;
  }

  getPermissionName(permissionId: string): string {
    const permission = this.permissions.find(p => p.id === permissionId);
    return permission ? permission.nom : permissionId;
  }

  getPermissionCategories(): string[] {
    return [...new Set(this.permissions.map(p => p.categorie))];
  }

  getPermissionsByCategory(category: string): Permission[] {
    return this.permissions.filter(p => p.categorie === category);
  }

  openCreateModal() {
    this.currentRole = {
      nom: '',
      description: '',
      permissions: [],
      utilisateurs: 0,
      couleur: '#3b82f6',
      actif: true
    };
    this.isEditing = false;
    this.showModal = true;
  }

  editRole(role: Role) {
    this.currentRole = { ...role };
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentRole = {};
  }

  toggleRole(role: Role) {
    console.log('Démonstration: Basculer le statut du rôle', role.nom, role.actif);
  }

  deleteRole(role: Role) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`)) {
      console.log('Démonstration: Suppression du rôle', role.nom);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.currentRole.permissions?.includes(permissionId) || false;
  }

  togglePermission(permissionId: string) {
    if (!this.currentRole.permissions) {
      this.currentRole.permissions = [];
    }
    
    const index = this.currentRole.permissions.indexOf(permissionId);
    if (index > -1) {
      this.currentRole.permissions.splice(index, 1);
    } else {
      this.currentRole.permissions.push(permissionId);
    }
  }

  saveRole() {
    if (this.isEditing) {
      console.log('Démonstration: Modification du rôle', this.currentRole);
    } else {
      console.log('Démonstration: Création du rôle', this.currentRole);
    }
    this.closeModal();
  }
}