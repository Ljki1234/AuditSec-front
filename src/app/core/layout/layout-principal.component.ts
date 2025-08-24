import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { NotificationBadgeComponent } from '../../shared/components/notification-badge/notification-badge.component';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth.models';

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSwitcherComponent, NotificationBadgeComponent],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">🔒</div>
            <span class="logo-text" [class.hidden]="sidebarCollapsed()">AuditSec</span>
          </div>
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <span [innerHTML]="sidebarCollapsed() ? '→' : '←'"></span>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-title" [class.hidden]="sidebarCollapsed()">Principal</div>
            <a routerLink="/tableau-de-bord" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📊</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Tableau de Bord</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-title" [class.hidden]="sidebarCollapsed()">Sites & Audits</div>
            <a routerLink="/sites" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🌐</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Sites</span>
            </a>
            <a routerLink="/audits" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🔍</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Audits</span>
            </a>
            <a routerLink="/audits-planifies" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📅</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Audits Planifiés</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-title" [class.hidden]="sidebarCollapsed()">Communication</div>
            <a routerLink="/notifications" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🔔</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Notifications</span>
              <app-notification-badge [count]="3"></app-notification-badge>
            </a>
            <a routerLink="/rapports" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📈</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Rapports</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-title" [class.hidden]="sidebarCollapsed()">Configuration</div>
            <a routerLink="/parametres/utilisateur" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Paramètres</span>
            </a>
            <a routerLink="/administration/utilisateurs" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">👥</span>
              <span class="nav-text" [class.hidden]="sidebarCollapsed()">Administration</span>
            </a>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-content" [class.expanded]="sidebarCollapsed()">
        <!-- Top Bar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
          </div>
          <div class="topbar-right">
            <app-theme-switcher></app-theme-switcher>
            <div class="user-menu" *ngIf="isAuthenticated && currentUser">
              <div class="user-avatar">
                <span>{{ getInitials(currentUser.username) }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.username }}</span>
                <span class="user-role">{{ getRoleDisplay(currentUser.roles) }}</span>
              </div>
              <button class="logout-button" (click)="logout()" title="Se déconnecter">
                <span>🚪</span>
              </button>
            </div>
            <div class="user-menu" *ngIf="!isAuthenticated">
              <a routerLink="/login" class="login-link">
                <span>🔑</span>
                <span>Se connecter</span>
              </a>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar {
      width: 280px;
      background-color: var(--bg-primary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      box-shadow: var(--shadow);
    }

    .sidebar.collapsed {
      width: 64px;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      width: 32px;
      height: 32px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      transition: opacity 0.3s ease;
    }

    .logo-text.hidden {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .sidebar-toggle:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-title {
      padding: 0 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      transition: opacity 0.3s ease;
    }

    .nav-title.hidden {
      opacity: 0;
      height: 0;
      margin-bottom: 0;
      overflow: hidden;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
      gap: 0.75rem;
    }

    .nav-link:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .nav-link.active {
      background-color: var(--primary-light);
      color: var(--primary-color);
      border-right: 3px solid var(--primary-color);
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-text {
      font-size: 0.875rem;
      font-weight: 500;
      transition: opacity 0.3s ease;
    }

    .nav-text.hidden {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: margin-left 0.3s ease;
    }

    .main-content.expanded {
      margin-left: 0;
    }

    .topbar {
      height: 64px;
      background-color: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      box-shadow: var(--shadow);
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .user-menu:hover {
      background-color: var(--bg-secondary);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .logout-button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .logout-button:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .login-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .login-link:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      background-color: var(--bg-secondary);
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        z-index: 1000;
        height: 100vh;
        transform: translateX(-100%);
      }

      .sidebar.collapsed {
        transform: translateX(0);
        width: 64px;
      }

      .main-content {
        margin-left: 0;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class LayoutPrincipalComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  currentUser: User | null = null;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if mobile and collapse sidebar by default
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed.set(true);
    }

    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentUser = state.user;
        this.isAuthenticated = state.isAuthenticated;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(username: string): string {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleDisplay(roles: string[]): string {
    if (roles.includes('ADMIN')) {
      return 'Administrateur';
    }
    return 'Utilisateur';
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  getPageTitle(): string {
    // This would typically come from router data or a service
    const path = window.location.pathname;
    const titles: { [key: string]: string } = {
      '/tableau-de-bord': 'Tableau de Bord',
      '/sites': 'Gestion des Sites',
      '/audits': 'Audits de Sécurité',
      '/audits-planifies': 'Audits Planifiés',
      '/notifications': 'Notifications',
      '/rapports': 'Rapports',
      '/parametres/utilisateur': 'Préférences Utilisateur',
      '/administration/utilisateurs': 'Administration'
    };
    
    return titles[path] || 'Audit de Sécurité';
  }
}