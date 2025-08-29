import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { QuizListComponent } from './components/quiz/quiz.component';
import { QuizTakeComponent } from './components/quiz-take/quiz-take.component';
import { QuizManagementComponent } from './components/quiz-management/quiz-management.component';
import { RoleGuard } from './guards/role-guard.service';
import { UserRole } from './models/user-role';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export const routes: Routes = [
  // Root redirect
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  
  // Public routes
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  
  // Protected dashboard (handles role-based content internally)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  
  // Specific parameterized routes first
  {
    path: 'quiz/:id/take',
    component: QuizTakeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.STUDENT }
  },
  
  // Specific nested routes
  {
    path: 'attendance/mark',
    component: AttendanceComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.TEACHER }
  },
  
  // General routes
  {
    path: 'quiz',
    component: QuizListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.STUDENT }
  },
  {
    path: 'quiz-management',
    component: QuizManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.TEACHER }
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    canActivate: [AuthGuard]
  },
  
  // Error route for unauthorized access
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
   
  },
  
  // Catch-all route
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];