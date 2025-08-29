import { Component, OnInit } from '@angular/core';
import { Attendance } from '../../models/attendance';
import { AttendanceStatus } from '../../models/attendance-status';
import { AauthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { UserRole } from '../../models/user-role';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceStats } from '../../models/attendance-stats';
import { Router, RouterModule } from '@angular/router'; // Add this import

@Component({
  selector: 'app-attendance',
  standalone: true, // Add standalone: true
  imports: [NavbarComponent, CommonModule, FormsModule, RouterModule], // Add RouterModule
  template: `
    <app-navbar></app-navbar>
    
    <div class="container-fluid py-4">
      <!-- Student View -->
      <div *ngIf="isStudent()">
        <div class="row mb-4">
          <div class="col-12">
            <h2><i class="fas fa-calendar-check me-2"></i>My Attendance</h2>
          </div>
        </div>

        <!-- Attendance Stats -->
        <div class="row mb-4" *ngIf="attendanceStats">
          <div class="col-md-3">
            <div class="card bg-success text-white h-100">
              <div class="card-body text-center">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <h4>{{ attendanceStats.presentCount }}</h4>
                <p class="mb-0">Present</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-danger text-white h-100">
              <div class="card-body text-center">
                <i class="fas fa-times-circle fa-2x mb-2"></i>
                <h4>{{ attendanceStats.absentCount }}</h4>
                <p class="mb-0">Absent</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-white h-100">
              <div class="card-body text-center">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <h4>{{ attendanceStats.lateCount }}</h4>
                <p class="mb-0">Late</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white h-100">
              <div class="card-body text-center">
                <i class="fas fa-percentage fa-2x mb-2"></i>
                <h4>{{ attendanceStats.attendancePercentage | number:'1.1-1' }}%</h4>
                <p class="mb-0">Overall</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Records -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Attendance History</h5>
              </div>
              <div class="card-body">
                <div *ngIf="attendanceRecords.length === 0" class="text-center py-4">
                  <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No attendance records found</h5>
                </div>

                <div class="table-responsive" *ngIf="attendanceRecords.length > 0">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Teacher</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let record of attendanceRecords">
                        <td>{{ record.attendanceDate | date:'mediumDate' }}</td>
                        <td>{{ record.subject }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': record.status === AttendanceStatus.PRESENT,
                            'bg-danger': record.status === AttendanceStatus.ABSENT,
                            'bg-warning': record.status === AttendanceStatus.LATE
                          }">
                            {{ record.status }}
                          </span>
                        </td>
                        <td>{{ record.teacherName }}</td>
                        <td>{{ record.remarks || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Teacher View -->
      <div *ngIf="isTeacher()">
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <h2><i class="fas fa-calendar-check me-2"></i>Attendance Management</h2>
              <button class="btn btn-primary" routerLink="/attendance/mark">
                <i class="fas fa-plus me-2"></i>Mark Attendance
              </button>
            </div>
          </div>
        </div>

        <!-- Date Filter -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <label for="dateFilter" class="form-label">Filter by Date</label>
                <input
                  type="date"
                  class="form-control"
                  id="dateFilter"
                  [(ngModel)]="selectedDate"
                  (change)="filterByDate()"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Records -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Attendance Records</h5>
              </div>
              <div class="card-body">
                <div *ngIf="teacherAttendanceRecords.length === 0" class="text-center py-4">
                  <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No attendance records found</h5>
                  <p class="text-muted">Start by marking attendance for your classes.</p>
                </div>

                <div class="table-responsive" *ngIf="teacherAttendanceRecords.length > 0">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Student ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let record of teacherAttendanceRecords">
                        <td>{{ record.attendanceDate | date:'mediumDate' }}</td>
                        <td>{{ record.studentName }}</td>
                        <td>{{ record.studentId }}</td>
                        <td>{{ record.subject }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': record.status === AttendanceStatus.PRESENT,
                            'bg-danger': record.status === AttendanceStatus.ABSENT,
                            'bg-warning': record.status === AttendanceStatus.LATE
                          }">
                            {{ record.status }}
                          </span>
                        </td>
                        <td>{{ record.remarks || '-' }}</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" (click)="editRecord(record)">
                            <i class="fas fa-edit"></i>
                          </button>
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
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: Attendance[] = [];
  teacherAttendanceRecords: Attendance[] = [];
  attendanceStats: AttendanceStats | null = null;
  selectedDate: string = '';
  
  // Make AttendanceStatus accessible in template
  AttendanceStatus = AttendanceStatus;

  constructor(
    private authService: AauthService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.loadAttendanceData();
  }

  loadAttendanceData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (this.isStudent()) {
      // Load student attendance
      this.attendanceService.getStudentAttendance(currentUser.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.attendanceRecords = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading student attendance:', error);
        }
      });

      // Load student stats
      this.attendanceService.getStudentAttendanceStats(currentUser.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.attendanceStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading attendance stats:', error);
        }
      });
    } else if (this.isTeacher()) {
      // Load teacher attendance records
      this.attendanceService.getAttendanceByTeacher(currentUser.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.teacherAttendanceRecords = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading teacher attendance:', error);
        }
      });
    }
  }

  filterByDate(): void {
    if (this.selectedDate) {
      this.attendanceService.getAttendanceByDate(this.selectedDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.teacherAttendanceRecords = response.data;
          }
        },
        error: (error) => {
          console.error('Error filtering by date:', error);
        }
      });
    } else {
      this.loadAttendanceData();
    }
  }

  editRecord(record: Attendance): void {
    // Implement edit functionality
    console.log('Edit record:', record);
    // You can navigate to an edit page or show a modal here
  }

  isStudent(): boolean {
    return this.authService.hasRole(UserRole.STUDENT);
  }

  isTeacher(): boolean {
    return this.authService.hasRole(UserRole.TEACHER);
  }
}
