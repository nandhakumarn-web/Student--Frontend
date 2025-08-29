import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback } from '../../models/feedback';
import { FeedbackCreate } from '../../models/feedback-create';
import { FeedbackCategory } from '../../models/feedback-category';
import { FeedbackStatus } from '../../models/feedback-status';
import { AauthService } from '../../services/auth.service';
import { FeedbackService } from '../../services/feedback.service';
import { UserRole } from '../../models/user-role';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  standalone: true, 
  imports: [NavbarComponent, CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <app-navbar></app-navbar>
    
    <div class="container-fluid py-4">
      <!-- Student View -->
      <div *ngIf="isStudent()">
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <h2><i class="fas fa-comment me-2"></i>Feedback</h2>
              <button 
                class="btn btn-primary" 
                data-bs-toggle="modal" 
                data-bs-target="#createFeedbackModal"
              >
                <i class="fas fa-plus me-2"></i>Submit Feedback
              </button>
            </div>
          </div>
        </div>

        <!-- My Feedback -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">My Feedback History</h5>
              </div>
              <div class="card-body">
                <div *ngIf="studentFeedback.length === 0" class="text-center py-4">
                  <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No feedback submitted yet</h5>
                  <p class="text-muted">Share your thoughts to help improve our services.</p>
                </div>

                <div class="table-responsive" *ngIf="studentFeedback.length > 0">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let feedback of studentFeedback">
                        <td>{{ feedback.subject }}</td>
                        <td>
                          <span class="badge bg-secondary">{{ feedback.category }}</span>
                        </td>
                        <td>
                          <div class="text-warning">
                            <i *ngFor="let star of getStars(feedback.rating)" class="fas fa-star"></i>
                            <i *ngFor="let star of getEmptyStars(feedback.rating)" class="far fa-star"></i>
                          </div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning': feedback.status === 'PENDING',
                            'bg-info': feedback.status === 'REVIEWED',
                            'bg-success': feedback.status === 'RESOLVED'
                          }">
                            {{ feedback.status }}
                          </span>
                        </td>
                        <td>{{ feedback.createdAt | date:'medium' }}</td>
                        <td>
                          <button 
                            class="btn btn-sm btn-outline-info"
                            (click)="viewFeedback(feedback)"
                            data-bs-toggle="modal"
                            data-bs-target="#viewFeedbackModal"
                          >
                            <i class="fas fa-eye"></i>
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

      <!-- Teacher/Admin View -->
      <div *ngIf="isTeacher() || isAdmin()">
        <div class="row mb-4">
          <div class="col-12">
            <h2><i class="fas fa-comments me-2"></i>Feedback Management</h2>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="row mb-4">
          <div class="col-12">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  [class.active]="activeTab === 'all'"
                  (click)="setActiveTab('all')"
                >
                  All Feedback ({{ allFeedback.length }})
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  [class.active]="activeTab === 'pending'"
                  (click)="setActiveTab('pending')"
                >
                  Pending ({{ pendingFeedback.length }})
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  [class.active]="activeTab === 'reviewed'"
                  (click)="setActiveTab('reviewed')"
                >
                  Reviewed ({{ reviewedFeedback.length }})
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  [class.active]="activeTab === 'resolved'"
                  (click)="setActiveTab('resolved')"
                >
                  Resolved ({{ resolvedFeedback.length }})
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Feedback List -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div *ngIf="getFilteredFeedback().length === 0" class="text-center py-4">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No feedback found</h5>
                </div>

                <div class="table-responsive" *ngIf="getFilteredFeedback().length > 0">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let feedback of getFilteredFeedback()">
                        <td>{{ feedback.studentName }}</td>
                        <td>{{ feedback.subject }}</td>
                        <td>
                          <span class="badge bg-secondary">{{ feedback.category }}</span>
                        </td>
                        <td>
                          <div class="text-warning">
                            <i *ngFor="let star of getStars(feedback.rating)" class="fas fa-star"></i>
                            <i *ngFor="let star of getEmptyStars(feedback.rating)" class="far fa-star"></i>
                          </div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning': feedback.status === 'PENDING',
                            'bg-info': feedback.status === 'REVIEWED',
                            'bg-success': feedback.status === 'RESOLVED'
                          }">
                            {{ feedback.status }}
                          </span>
                        </td>
                        <td>{{ feedback.createdAt | date:'medium' }}</td>
                        <td>
                          <button 
                            class="btn btn-sm btn-outline-info me-1"
                            (click)="viewFeedback(feedback)"
                            data-bs-toggle="modal"
                            data-bs-target="#viewFeedbackModal"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          <button 
                            class="btn btn-sm btn-outline-primary"
                            (click)="respondToFeedback(feedback)"
                            data-bs-toggle="modal"
                            data-bs-target="#respondModal"
                            *ngIf="feedback.status !== 'RESOLVED'"
                          >
                            <i class="fas fa-reply"></i>
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

    <!-- Create Feedback Modal -->
    <div class="modal fade" id="createFeedbackModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Submit Feedback</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="feedbackForm" (ngSubmit)="submitFeedback()">
            <div class="modal-body">
              <div class="mb-3">
                <label for="subject" class="form-label">Subject</label>
                <input
                  type="text"
                  class="form-control"
                  id="subject"
                  formControlName="subject"
                  [class.is-invalid]="feedbackForm.get('subject')?.invalid && feedbackForm.get('subject')?.touched"
                >
                <div class="invalid-feedback">Subject is required.</div>
              </div>

              <div class="mb-3">
                <label for="category" class="form-label">Category</label>
                <select
                  class="form-select"
                  id="category"
                  formControlName="category"
                  [class.is-invalid]="feedbackForm.get('category')?.invalid && feedbackForm.get('category')?.touched"
                >
                  <option value="">Select Category</option>
                  <option value="TEACHING">Teaching</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="ADMINISTRATION">Administration</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="OTHER">Other</option>
                </select>
                <div class="invalid-feedback">Category is required.</div>
              </div>

              <div class="mb-3">
                <label for="rating" class="form-label">Rating</label>
                <div class="rating-container">
                  <div class="btn-group" role="group">
                    <input type="radio" class="btn-check" [id]="'rating' + i" formControlName="rating" [value]="i" *ngFor="let i of [1,2,3,4,5]">
                    <label class="btn btn-outline-warning" [for]="'rating' + i" *ngFor="let i of [1,2,3,4,5]">
                      <i class="fas fa-star"></i> {{ i }}
                    </label>
                  </div>
                </div>
                <div class="invalid-feedback" *ngIf="feedbackForm.get('rating')?.invalid && feedbackForm.get('rating')?.touched">
                  Rating is required.
                </div>
              </div>

              <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea
                  class="form-control"
                  id="message"
                  rows="5"
                  formControlName="message"
                  [class.is-invalid]="feedbackForm.get('message')?.invalid && feedbackForm.get('message')?.touched"
                ></textarea>
                <div class="invalid-feedback">Message is required.</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="feedbackForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Feedback Modal -->
    <div class="modal fade" id="viewFeedbackModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Feedback Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" *ngIf="selectedFeedback">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Student:</strong> {{ selectedFeedback.studentName }}
              </div>
              <div class="col-md-6">
                <strong>Date:</strong> {{ selectedFeedback.createdAt | date:'medium' }}
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Category:</strong> 
                <span class="badge bg-secondary ms-2">{{ selectedFeedback.category }}</span>
              </div>
              <div class="col-md-6">
                <strong>Rating:</strong>
                <div class="text-warning ms-2">
                  <i *ngFor="let star of getStars(selectedFeedback.rating)" class="fas fa-star"></i>
                  <i *ngFor="let star of getEmptyStars(selectedFeedback.rating)" class="far fa-star"></i>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <strong>Subject:</strong>
              <p class="mt-2">{{ selectedFeedback.subject }}</p>
            </div>

            <div class="mb-3">
              <strong>Message:</strong>
              <p class="mt-2">{{ selectedFeedback.message }}</p>
            </div>

            <div class="mb-3" *ngIf="selectedFeedback.adminResponse">
              <strong>Admin Response:</strong>
              <div class="alert alert-info mt-2">
                {{ selectedFeedback.adminResponse }}
              </div>
              <small class="text-muted" *ngIf="selectedFeedback.respondedAt">
                Responded on: {{ selectedFeedback.respondedAt | date:'medium' }}
              </small>
            </div>

            <div class="mb-3">
              <strong>Status:</strong>
              <span class="badge ms-2" [ngClass]="{
                'bg-warning': selectedFeedback.status === 'PENDING',
                'bg-info': selectedFeedback.status === 'REVIEWED',
                'bg-success': selectedFeedback.status === 'RESOLVED'
              }">
                {{ selectedFeedback.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Respond Modal -->
    <div class="modal fade" id="respondModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Respond to Feedback</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="responseForm" (ngSubmit)="submitResponse()">
            <div class="modal-body">
              <div class="mb-3">
                <label for="status" class="form-label">Status</label>
                <select class="form-select" id="status" formControlName="status">
                  <option value="REVIEWED">Reviewed</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="adminResponse" class="form-label">Response</label>
                <textarea
                  class="form-control"
                  id="adminResponse"
                  rows="4"
                  formControlName="adminResponse"
                  placeholder="Enter your response..."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="responseForm.invalid || isResponding"
              >
                <span *ngIf="isResponding" class="spinner-border spinner-border-sm me-2"></span>
                {{ isResponding ? 'Submitting...' : 'Submit Response' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rating-container .btn-check:checked + .btn {
      background-color: #ffc107;
      border-color: #ffc107;
      color: #000;
    }
    .nav-tabs .nav-link.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }
  `]
})
export class FeedbackComponent implements OnInit {
  feedbackForm: FormGroup;
  responseForm: FormGroup;
  studentFeedback: Feedback[] = [];
  allFeedback: Feedback[] = [];
  pendingFeedback: Feedback[] = [];
  reviewedFeedback: Feedback[] = [];
  resolvedFeedback: Feedback[] = [];
  selectedFeedback: Feedback | null = null;
  activeTab = 'all';
  isSubmitting = false;
  isResponding = false;

  constructor(
    private fb: FormBuilder,
    private authService: AauthService,
    private feedbackService: FeedbackService
  ) {
    this.feedbackForm = this.fb.group({
      subject: ['', Validators.required],
      category: ['', Validators.required],
      rating: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.responseForm = this.fb.group({
      status: ['REVIEWED', Validators.required],
      adminResponse: ['']
    });
  }

  ngOnInit(): void {
    this.loadFeedbackData();
  }

  loadFeedbackData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (this.isStudent()) {
      this.feedbackService.getFeedbackByStudent(currentUser.id).subscribe(response => {
        if (response.success) {
          this.studentFeedback = response.data;
        }
      });
    } else if (this.isTeacher() || this.isAdmin()) {
      this.feedbackService.getAllFeedback().subscribe(response => {
        if (response.success) {
          this.allFeedback = response.data;
          this.filterFeedbackByStatus();
        }
      });
    }
  }

  filterFeedbackByStatus(): void {
    this.pendingFeedback = this.allFeedback.filter(f => f.status === FeedbackStatus.PENDING);
    this.reviewedFeedback = this.allFeedback.filter(f => f.status === FeedbackStatus.REVIEWED);
    this.resolvedFeedback = this.allFeedback.filter(f => f.status === FeedbackStatus.RESOLVED);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getFilteredFeedback(): Feedback[] {
    switch (this.activeTab) {
      case 'pending': return this.pendingFeedback;
      case 'reviewed': return this.reviewedFeedback;
      case 'resolved': return this.resolvedFeedback;
      default: return this.allFeedback;
    }
  }

  submitFeedback(): void {
    if (this.feedbackForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;

      this.isSubmitting = true;
      const feedbackData: FeedbackCreate = this.feedbackForm.value;

      this.feedbackService.createFeedback(feedbackData, currentUser.id).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.feedbackForm.reset();
            this.loadFeedbackData();
            // Close modal
            const modal = document.getElementById('createFeedbackModal');
            if (modal) {
              const bsModal = new (window as any).bootstrap.Modal(modal);
              bsModal.hide();
            }
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error submitting feedback:', error);
        }
      });
    }
  }

  viewFeedback(feedback: Feedback): void {
    this.selectedFeedback = feedback;
  }

  respondToFeedback(feedback: Feedback): void {
    this.selectedFeedback = feedback;
    this.responseForm.patchValue({
      status: FeedbackStatus.REVIEWED,
      adminResponse: ''
    });
  }

  submitResponse(): void {
    if (this.responseForm.valid && this.selectedFeedback) {
      this.isResponding = true;

      this.feedbackService.updateFeedbackStatus(
        this.selectedFeedback.id,
        this.responseForm.value
      ).subscribe({
        next: (response) => {
          this.isResponding = false;
          if (response.success) {
            this.responseForm.reset();
            this.loadFeedbackData();
            // Close modal
            const modal = document.getElementById('respondModal');
            if (modal) {
              const bsModal = new (window as any).bootstrap.Modal(modal);
              bsModal.hide();
            }
          }
        },
        error: (error) => {
          this.isResponding = false;
          console.error('Error updating feedback:', error);
        }
      });
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating }, (_, i) => i);
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
}