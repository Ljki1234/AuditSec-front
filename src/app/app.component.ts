import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LayoutPrincipalComponent } from './core/layout/layout-principal.component';
import { AuthLayoutComponent } from './features/auth/auth-layout/auth-layout.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutPrincipalComponent, AuthLayoutComponent, CommonModule],
  template: `
    <!-- Authentication routes - standalone layout without dashboard sidebar -->
    <app-auth-layout *ngIf="isAuthRoute">
      <router-outlet></router-outlet>
    </app-auth-layout>
    
    <!-- Dashboard routes - full layout with sidebar -->
    <app-layout-principal *ngIf="!isAuthRoute">
      <router-outlet></router-outlet>
    </app-layout-principal>
  `
})
export class AppComponent {
  title = 'Audit Sécurité - Interface d\'Administration';
  isAuthRoute = false;

  private authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAuthRoute = this.authRoutes.some(route => 
        event.urlAfterRedirects.startsWith(route)
      );
    });
  }
}