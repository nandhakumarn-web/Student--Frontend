import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { Quiz } from '../../models/quiz';
import { QuizAttempt } from '../../models/quiz-attempt';
import { AauthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';
import { AttendanceService } from '../../services/attendance.service';
import { FeedbackService } from '../../services/feedback.service';
import { UserRole } from '../../models/user-role';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttendanceStats } from '../../models/attendance-stats';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="bg-primary text-white p-4 rounded">
            <h1 class="display-6 mb-2">Welcome, {{ currentUser?.firstName }}!</h1>
            <p class="lead mb-0">{{ getRoleDescription() }}</p>
          </div>
        </div>
      </div>

      <!-- Student Dashboard -->
      <div *ngIf="isStudent()">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-success text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Attendance</h6>
                    <h2 class="mb-0">{{ attendanceStats?.attendancePercentage || 0 | number : '1.1-1' }}%</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-calendar-check fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-info text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Completed Quizzes</h6>
                    <h2 class="mb-0">{{ completedQuizzes }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-question-circle fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-warning text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Available Quizzes</h6>
                    <h2 class="mb-0">{{ availableQuizzes.length }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-clock fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-secondary text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Total Classes</h6>
                    <h2 class="mb-0">{{ attendanceStats?.totalClasses || 0 }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-book fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Quizzes -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-question-circle me-2"></i>Available Quizzes</h5>
              </div>
              <div class="card-body">
                <div *ngIf="availableQuizzes.length === 0" class="text-center text-muted py-4">
                  <i class="fas fa-info-circle fa-2x mb-3"></i>
                  <p>No quizzes available at the moment.</p>
                </div>

                <div class="row" *ngIf="availableQuizzes.length > 0">
                  <div class="col-md-6 col-lg-4 mb-3" *ngFor="let quiz of availableQuizzes">
                    <div class="card h-100 border-primary">
                      <div class="card-body">
                        <h6 class="card-title">{{ quiz.title }}</h6>
                        <p class="card-text text-muted small">{{ quiz.description }}</p>

                        <div class="small mb-3">
                          <div class="mb-1">
                            <i class="fas fa-clock me-1"></i>Duration: {{ quiz.duration }} minutes
                          </div>
                          <div class="mb-1">
                            <i class="fas fa-star me-1"></i>Total Marks: {{ quiz.totalMarks }}
                          </div>
                          <div class="mb-1">
                            <i class="fas fa-calendar me-1"></i>Due: {{ quiz.endTime | date : 'medium' }}
                          </div>
                        </div>

                        <button class="btn btn-primary btn-sm w-100" (click)="startQuiz(quiz.id)">
                          <i class="fas fa-play me-1"></i>Start Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Quiz Attempts -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Quiz Attempts</h5>
              </div>
              <div class="card-body">
                <div *ngIf="recentAttempts.length === 0" class="text-center text-muted py-4">
                  <i class="fas fa-clipboard-list fa-2x mb-3"></i>
                  <p>No quiz attempts yet.</p>
                </div>

                <div class="table-responsive" *ngIf="recentAttempts.length > 0">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Quiz Title</th>
                        <th>Score</th>
                        <th>Completed At</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let attempt of recentAttempts">
                        <td>{{ attempt.quizTitle }}</td>
                        <td>
                          <span class="fw-bold">{{ attempt.scoreObtained || 0 }}</span>
                          <span class="text-muted">/ {{ attempt.totalQuestions * 5 }}</span>
                        </td>
                        <td>{{ attempt.submittedAt | date : 'medium' }}</td>
                        <td>
                          <span class="badge" [ngClass]="attempt.isCompleted ? 'bg-success' : 'bg-warning'">
                            {{ attempt.isCompleted ? 'Completed' : 'In Progress' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Teacher Dashboard -->
      <div *ngIf="isTeacher()">
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">My Quizzes</h6>
                    <h2 class="mb-0">{{ myQuizzes.length }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-question-circle fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-success text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Active Quizzes</h6>
                    <h2 class="mb-0">{{ activeQuizzes }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-play-circle fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-info text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Total Attempts</h6>
                    <h2 class="mb-0">{{ totalAttempts }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-users fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-warning text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Pending Reviews</h6>
                    <h2 class="mb-0">{{ pendingReviews }}</h2>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-clock fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-primary w-100" routerLink="/quiz-management/create">
                      <i class="fas fa-plus me-2"></i>Create Quiz
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-success w-100" routerLink="/attendance/mark">
                      <i class="fas fa-check me-2"></i>Mark Attendance
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-info w-100" routerLink="/quiz-management">
                      <i class="fas fa-eye me-2"></i>View Results
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-warning w-100" routerLink="/feedback">
                      <i class="fas fa-comments me-2"></i>View Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div *ngIf="isAdmin()">
        <div class="row mb-4">
          <div class="col-12">
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Admin Panel:</strong> Manage all system operations, users, and monitor overall activity.
            </div>
          </div>
        </div>

        <!-- Admin Quick Actions -->
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <i class="fas fa-users fa-3x text-primary mb-3"></i>
                <h5>Manage Users</h5>
                <p class="text-muted">Add, edit, or deactivate users</p>
                <button class="btn btn-primary" (click)="navigateToUsers()">View Users</button>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <i class="fas fa-chart-bar fa-3x text-success mb-3"></i>
                <h5>System Reports</h5>
                <p class="text-muted">View detailed analytics</p>
                <button class="btn btn-success" (click)="navigateToReports()">View Reports</button>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <i class="fas fa-comments fa-3x text-warning mb-3"></i>
                <h5>All Feedback</h5>
                <p class="text-muted">Review and respond to feedback</p>
                <button class="btn btn-warning" routerLink="/feedback">View Feedback</button>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <i class="fas fa-cog fa-3x text-secondary mb-3"></i>
                <h5>System Settings</h5>
                <p class="text-muted">Configure system parameters</p>
                <button class="btn btn-secondary" (click)="navigateToSettings()">Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  availableQuizzes: Quiz[] = [];
  recentAttempts: QuizAttempt[] = [];
  attendanceStats: AttendanceStats | null = null;
  myQuizzes: Quiz[] = [];

  completedQuizzes = 0;
  activeQuizzes = 0;
  totalAttempts = 0;
  pendingReviews = 0;

  constructor(
    private authService: AauthService,
    private quizService: QuizService,
    private attendanceService: AttendanceService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.currentUser) return;

    if (this.isStudent()) {
      this.loadStudentData();
    } else if (this.isTeacher()) {
      this.loadTeacherData();
    }
  }

  loadStudentData(): void {
    if (!this.currentUser) return;

    this.quizService.getAllActiveQuizzes().subscribe((response) => {
      if (response.success) {
        this.availableQuizzes = response.data;
      }
    });

    this.quizService.getStudentQuizAttempts(this.currentUser.id).subscribe((response) => {
      if (response.success) {
        this.recentAttempts = response.data.slice(0, 5);
        this.completedQuizzes = response.data.filter((a) => a.isCompleted).length;
      }
    });

    this.attendanceService.getStudentAttendanceStats(this.currentUser.id).subscribe((response) => {
      if (response.success) {
        this.attendanceStats = response.data;
      }
    });
  }

  loadTeacherData(): void {
    if (!this.currentUser) return;

    this.quizService.getQuizzesByTeacher(this.currentUser.id).subscribe((response) => {
      if (response.success) {
        this.myQuizzes = response.data;
        this.activeQuizzes = response.data.filter((q) => q.isActive).length;
      }
    });
  }

  startQuiz(quizId: number): void {
    if (!this.currentUser) return;

    this.quizService.startQuiz(quizId, this.currentUser.id).subscribe((response) => {
      if (response.success) {
        this.router.navigate(['/quiz', quizId, 'take'], { 
          queryParams: { attemptId: response.data.id } 
        });
      }
    });
  }

  // Fixed Admin Navigation Methods
  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/admin/settings']);
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

  getRoleDescription(): string {
    if (this.isStudent()) {
      return 'Access your quizzes, view attendance, and submit feedback.';
    } else if (this.isTeacher()) {
      return 'Create quizzes, manage attendance, and review student performance.';
    } else if (this.isAdmin()) {
      return 'Oversee all system operations and manage users.';
    }
    return '';
  }
}
