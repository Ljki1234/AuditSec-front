import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profil-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container fade-in">
      <div class="page-header">
        <h1>Profil Utilisateur</h1>
        <p>Gérez vos informations personnelles et préférences</p>
      </div>

      <div class="profile-layout">
        <!-- Sidebar Profile -->
        <div class="profile-sidebar">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" 
                   alt="Photo de profil" class="avatar-image">
              <button class="avatar-edit" (click)="editAvatar()">
                <span>📷</span>
              </button>
            </div>
            <div class="profile-info">
              <h3>{{ userProfile.firstName }} {{ userProfile.lastName }}</h3>
              <p>{{ userProfile.role }}</p>
              <span class="badge badge-success">Actif</span>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">24</div>
              <div class="stat-label">Sites surveillés</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">156</div>
              <div class="stat-label">Audits réalisés</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">98%</div>
              <div class="stat-label">Score sécurité</div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="profile-content">
          <div class="profile-tabs">
            <button class="tab-button" 
                    [class.active]="activeTab === 'personal'" 
                    (click)="setActiveTab('personal')">
              Informations personnelles
            </button>
            <button class="tab-button" 
                    [class.active]="activeTab === 'security'" 
                    (click)="setActiveTab('security')">
              Sécurité
            </button>
            <button class="tab-button" 
                    [class.active]="activeTab === 'notifications'" 
                    (click)="setActiveTab('notifications')">
              Notifications
            </button>
          </div>

          <!-- Informations personnelles -->
          <div class="tab-content" *ngIf="activeTab === 'personal'">
            <div class="card">
              <div class="card-header">
                <h3>Informations personnelles</h3>
              </div>
              <div class="card-body">
                <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="firstName" class="form-label">Prénom</label>
                      <input type="text" id="firstName" class="form-control"
                             [(ngModel)]="userProfile.firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                      <label for="lastName" class="form-label">Nom</label>
                      <input type="text" id="lastName" class="form-control"
                             [(ngModel)]="userProfile.lastName" name="lastName" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control"
                           [(ngModel)]="userProfile.email" name="email" required>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="phone" class="form-label">Téléphone</label>
                      <input type="tel" id="phone" class="form-control"
                             [(ngModel)]="userProfile.phone" name="phone">
                    </div>
                    <div class="form-group">
                      <label for="company" class="form-label">Entreprise</label>
                      <input type="text" id="company" class="form-control"
                             [(ngModel)]="userProfile.company" name="company">
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="bio" class="form-label">Biographie</label>
                    <textarea id="bio" class="form-control" rows="4"
                              [(ngModel)]="userProfile.bio" name="bio"
                              placeholder="Parlez-nous de vous..."></textarea>
                  </div>

                  <div class="form-actions">
                    <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
                      Sauvegarder les modifications
                    </button>
                    <button type="button" class="btn btn-secondary" (click)="resetForm()">
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Sécurité -->
          <div class="tab-content" *ngIf="activeTab === 'security'">
            <div class="card">
              <div class="card-header">
                <h3>Changer le mot de passe</h3>
              </div>
              <div class="card-body">
                <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
                  <div class="form-group">
                    <label for="currentPassword" class="form-label">Mot de passe actuel</label>
                    <input type="password" id="currentPassword" class="form-control"
                           [(ngModel)]="passwordData.currentPassword" name="currentPassword" required>
                  </div>

                  <div class="form-group">
                    <label for="newPassword" class="form-label">Nouveau mot de passe</label>
                    <input type="password" id="newPassword" class="form-control"
                           [(ngModel)]="passwordData.newPassword" name="newPassword" 
                           required minlength="8">
                  </div>

                  <div class="form-group">
                    <label for="confirmNewPassword" class="form-label">Confirmer le nouveau mot de passe</label>
                    <input type="password" id="confirmNewPassword" class="form-control"
                           [(ngModel)]="passwordData.confirmNewPassword" name="confirmNewPassword" required>
                  </div>

                  <div class="form-actions">
                    <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid">
                      Modifier le mot de passe
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3>Authentification à deux facteurs</h3>
              </div>
              <div class="card-body">
                <div class="security-option">
                  <div class="security-info">
                    <h4>Authentification SMS</h4>
                    <p>Recevez un code par SMS pour sécuriser votre connexion</p>
                  </div>
                  <div class="security-toggle">
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="securitySettings.smsAuth">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="security-option">
                  <div class="security-info">
                    <h4>Application d'authentification</h4>
                    <p>Utilisez une app comme Google Authenticator</p>
                  </div>
                  <div class="security-toggle">
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="securitySettings.appAuth">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="tab-content" *ngIf="activeTab === 'notifications'">
            <div class="card">
              <div class="card-header">
                <h3>Préférences de notifications</h3>
              </div>
              <div class="card-body">
                <div class="notification-settings">
                  <div class="notification-group" *ngFor="let group of notificationGroups">
                    <h4>{{ group.title }}</h4>
                    <div class="notification-options">
                      <div class="notification-option" *ngFor="let option of group.options">
                        <div class="option-info">
                          <div class="option-title">{{ option.title }}</div>
                          <div class="option-description">{{ option.description }}</div>
                        </div>
                        <div class="option-controls">
                          <label class="checkbox-label">
                            <input type="checkbox" [(ngModel)]="option.email">
                            <span class="checkmark"></span>
                            Email
                          </label>
                          <label class="checkbox-label">
                            <input type="checkbox" [(ngModel)]="option.push">
                            <span class="checkmark"></span>
                            Push
                          </label>
                          <label class="checkbox-label">
                            <input type="checkbox" [(ngModel)]="option.sms">
                            <span class="checkmark"></span>
                            SMS
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-primary" (click)="saveNotificationPreferences()">
                    Sauvegarder les préférences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .page-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-avatar-section {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      text-align: center;
    }

    .avatar-container {
      position: relative;
      display: inline-block;
      margin-bottom: 1rem;
    }

    .avatar-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--border-color);
    }

    .avatar-edit {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: var(--primary-color);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.875rem;
      color: white;
      box-shadow: var(--shadow);
      transition: all 0.2s ease;
    }

    .avatar-edit:hover {
      background-color: var(--primary-dark);
      transform: scale(1.1);
    }

    .profile-info h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .profile-info p {
      margin: 0 0 0.75rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .profile-stats {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .stat-item {
      text-align: center;
      margin-bottom: 1rem;
    }

    .stat-item:last-child {
      margin-bottom: 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-content {
      background-color: var(--bg-primary);
      border-radius: 0.75rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .profile-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
    }

    .tab-button {
      flex: 1;
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      position: relative;
    }

    .tab-button:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .tab-button.active {
      color: var(--primary-color);
      background-color: var(--primary-light);
    }

    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--primary-color);
    }

    .tab-content {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .security-option {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .security-option:last-child {
      border-bottom: none;
    }

    .security-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 500;
    }

    .security-info p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
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
      background-color: var(--primary-color);
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .notification-settings {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .notification-group h4 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.125rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .notification-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-option {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--bg-secondary);
    }

    .option-info {
      flex: 1;
    }

    .option-title {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .option-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .option-controls {
      display: flex;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 14px;
      height: 14px;
      border: 1px solid var(--border-color);
      border-radius: 0.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 0.625rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .profile-layout {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .profile-tabs {
        flex-direction: column;
      }

      .option-controls {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ProfilUtilisateurComponent {
  activeTab = 'personal';
  
  userProfile = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@exemple.com',
    phone: '01 23 45 67 89',
    company: 'Tech Solutions SARL',
    bio: 'Expert en sécurité informatique avec plus de 10 ans d\'expérience dans l\'audit et la protection des systèmes.',
    role: 'Administrateur Sécurité'
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  securitySettings = {
    smsAuth: true,
    appAuth: false
  };

  notificationGroups = [
    {
      title: 'Audits de sécurité',
      options: [
        {
          title: 'Nouveau audit terminé',
          description: 'Quand un audit de vos sites est terminé',
          email: true,
          push: true,
          sms: false
        },
        {
          title: 'Vulnérabilités critiques détectées',
          description: 'Quand des failles de sécurité critiques sont trouvées',
          email: true,
          push: true,
          sms: true
        }
      ]
    },
    {
      title: 'Surveillance des sites',
      options: [
        {
          title: 'Site inaccessible',
          description: 'Quand un de vos sites devient inaccessible',
          email: true,
          push: true,
          sms: false
        },
        {
          title: 'Certificat SSL expiré',
          description: 'Quand un certificat SSL approche de l\'expiration',
          email: true,
          push: false,
          sms: false
        }
      ]
    },
    {
      title: 'Rapports et analyses',
      options: [
        {
          title: 'Rapport mensuel disponible',
          description: 'Quand votre rapport mensuel est généré',
          email: true,
          push: false,
          sms: false
        }
      ]
    }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  editAvatar() {
    console.log('Démonstration: Ouvrir sélecteur de fichier pour avatar');
  }

  updateProfile() {
    console.log('Démonstration: Mise à jour du profil', this.userProfile);
  }

  resetForm() {
    console.log('Démonstration: Réinitialisation du formulaire');
  }

  changePassword() {
    console.log('Démonstration: Changement de mot de passe', this.passwordData);
  }

  saveNotificationPreferences() {
    console.log('Démonstration: Sauvegarde des préférences de notification', this.notificationGroups);
  }
}