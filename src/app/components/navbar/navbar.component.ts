import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AauthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { UserRole } from '../../models/user-role';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="fas fa-graduation-cap me-2"></i>
          EMS
        </a>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="fas fa-home me-1"></i>Dashboard
              </a>
            </li>

            <!-- Student Navigation -->
            <ng-container *ngIf="isStudent()">
              <li class="nav-item">
                <a class="nav-link" routerLink="/quiz" routerLinkActive="active">
                  <i class="fas fa-question-circle me-1"></i>Quizzes
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/attendance" routerLinkActive="active">
                  <i class="fas fa-calendar-check me-1"></i>My Attendance
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/feedback" routerLinkActive="active">
                  <i class="fas fa-comment me-1"></i>Feedback
                </a>
              </li>
            </ng-container>

            <!-- Teacher Navigation -->
            <ng-container *ngIf="isTeacher()">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-chalkboard-teacher me-1"></i>Teaching
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/quiz-management">
                    <i class="fas fa-question-circle me-1"></i>Manage Quizzes
                  </a></li>
                  <li><a class="dropdown-item" routerLink="/attendance/mark">
                    <i class="fas fa-check me-1"></i>Mark Attendance
                  </a></li>
                  <li><a class="dropdown-item" routerLink="/attendance">
                    <i class="fas fa-calendar-alt me-1"></i>View Attendance
                  </a></li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/feedback" routerLinkActive="active">
                  <i class="fas fa-comments me-1"></i>Feedback
                </a>
              </li>
            </ng-container>

            <!-- Admin Navigation -->
            <ng-container *ngIf="isAdmin()">
              <li class="nav-item">
                <a class="nav-link" routerLink="/users" routerLinkActive="active">
                  <i class="fas fa-users me-1"></i>Users
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/reports" routerLinkActive="active">
                  <i class="fas fa-chart-bar me-1"></i>Reports
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/feedback" routerLinkActive="active">
                  <i class="fas fa-comments me-1"></i>All Feedback
                </a>
              </li>
            </ng-container>
          </ul>

          <!-- User Menu -->
          <ul class="navbar-nav">
            <li class="nav-item dropdown" *ngIf="currentUser">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>
                {{ currentUser.firstName }} {{ currentUser.lastName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><h6 class="dropdown-header">{{ getRoleDisplayName() }}</h6></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" (click)="viewProfile()">
                  <i class="fas fa-user me-1"></i>Profile
                </a></li>
                <li><a class="dropdown-item" href="#" (click)="changePassword()">
                  <i class="fas fa-key me-1"></i>Change Password
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-1"></i>Logout
                </a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    
    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
      border-radius: 4px;
    }
    
    .dropdown-menu {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    .dropdown-header {
      color: #6c757d;
      font-size: 0.875rem;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AauthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isStudent(): boolean {
    return this.authService.hasRole(UserRole.STUDENT);
  }

  isTeacher(): boolean {
    return this.authService.hasRole(UserRole.TEACHER);
  }

  isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  getRoleDisplayName(): string {
    if (this.isStudent()) return 'Student';
    if (this.isTeacher()) return 'Teacher';
    if (this.isAdmin()) return 'Administrator';
    return '';
  }

  viewProfile(): void {
    // Navigate to profile page
    this.router.navigate(['/profile']);
  }

  changePassword(): void {
    // Navigate to change password page
    this.router.navigate(['/change-password']);
  }

  logout(): void {
    this.authService.logout();
  }
}