import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'tableau-de-bord',
    loadComponent: () => import('./features/tableau-de-bord/tableau-de-bord.component').then(m => m.TableauDeBordComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/authentification/connexion/connexion.component').then(m => m.ConnexionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/authentification/inscription/inscription.component').then(m => m.InscriptionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profil-utilisateur',
    loadComponent: () => import('./features/authentification/profil-utilisateur/profil-utilisateur.component').then(m => m.ProfilUtilisateurComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion-roles',
    loadComponent: () => import('./features/authentification/gestion-roles/gestion-roles.component').then(m => m.GestionRolesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sites',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/sites/liste-sites/liste-sites.component').then(m => m.ListeSitesComponent),
        canActivate: [AuthGuard]
      }
      // Commented out missing components
      // {
      //   path: 'ajouter',
      //   loadComponent: () => import('./features/sites/ajouter-modifier-site/ajouter-modifier-site.component').then(m => m.AjouterModifierSiteComponent)
      // },
      // {
      //   path: 'modifier/:id',
      //   loadComponent: () => import('./features/sites/ajouter-modifier-site/ajouter-modifier-site.component').then(m => m.AjouterModifierSiteComponent)
      // },
      // {
      //   path: ':id',
      //   loadComponent: () => import('./features/sites/details-site/details-site.component').then(m => m.DetailsSiteComponent)
      // }
    ]
  },
  // Catch all route - redirect to login
  {
    path: '**',
    redirectTo: '/login'
  }
  // Commented out missing feature routes
  // {
  //   path: 'audits',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/audits/liste-audits/liste-audits.component').then(m => m.ListeAuditsComponent)
  //     },
  //     {
  //       path: 'lancer',
  //       loadComponent: () => import('./features/audits/lancer-audit/lancer-audit.component').then(m => m.LancerAuditComponent)
  //     },
  //     {
  //       path: ':id',
  //       loadComponent: () => import('./features/audits/details-audit/details-audit.component').then(m => m.DetailsAuditComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'audits-planifies',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/audits-planifies/liste-audits-planifies/liste-audits-planifies.component').then(m => m.ListeAuditsPlanifiesComponent)
  //     },
  //     {
  //       path: 'calendrier',
  //       loadComponent: () => import('./features/audits-planifies/calendrier/calendrier.component').then(m => m.CalendrierComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'notifications',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/notifications/liste-notifications/liste-notifications.component').then(m => m.ListeNotificationsComponent)
  //     },
  //     {
  //       path: 'parametres',
  //       loadComponent: () => import('./features/notifications/parametres-notifications/parametres-notifications.component').then(m => m.ParametresNotificationsComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'rapports',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/rapports/generer-rapport/generer-rapport.component').then(m => m.GenererRapportComponent)
  //     },
  //     {
  //       path: 'export',
  //       loadComponent: () => import('./features/rapports/export-pdf-csv/export-pdf-csv.component').then(m => m.ExportPdfCsvComponent)
  //     },
  //     {
  //       path: 'tableaux',
  //       loadComponent: () => import('./features/rapports/tableaux/tableaux.component').then(m => m.TableauxComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'parametres',
  //   children: [
  //     {
  //       path: 'utilisateur',
  //       loadComponent: () => import('./features/parametres/preferences-utilisateur/preferences-utilisateur.component').then(m => m.PreferencesUtilisateurComponent)
  //     },
  //     {
  //       path: 'systeme',
  //       loadComponent: () => import('./features/parametres/preferences-systeme/preferences-systeme.component').then(m => m.PreferencesSystemeComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'administration',
  //   children: [
  //     {
  //       path: 'utilisateurs',
  //       loadComponent: () => import('./features/administration/gestion-utilisateurs/gestion-utilisateurs.component').then(m => m.GestionUtilisateursComponent)
  //     },
  //     {
  //       path: 'logs',
  //       loadComponent: () => import('./features/administration/supervision-logs/supervision-logs.component').then(m => m.SupervisionLogsComponent)
  //     },
  //     {
  //       path: 'tableau-de-bord',
  //       loadComponent: () => import('./features/administration/tableau-de-bord-admin/tableau-de-bord-admin.component').then(m => m.TableauDeBordAdminComponent)
  //     }
  //   ]
  // }
];