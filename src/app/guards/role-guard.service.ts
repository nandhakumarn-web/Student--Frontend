import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AauthService } from '../services/auth.service';
import { UserRole } from '../models/user-role';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AauthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const requiredRole = route.data['role'] as UserRole;
    
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    // Then check role
    if (this.authService.hasRole(requiredRole)) {
      return true;
    }

    // Redirect based on user's actual role
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      switch (currentUser.role) {
        case UserRole.ADMIN:
          return this.router.createUrlTree(['/admin']);
        case UserRole.TEACHER:
          return this.router.createUrlTree(['/teacher']);
        case UserRole.STUDENT:
          return this.router.createUrlTree(['/student']);
        default:
          return this.router.createUrlTree(['/dashboard']);
      }
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}