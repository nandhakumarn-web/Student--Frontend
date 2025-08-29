import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../models/quiz';
import { QuizService } from '../../services/quiz.service';
import { AauthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  imports: [NavbarComponent,CommonModule,FormsModule],
  standalone: true, 
  template: `
    <app-navbar></app-navbar>
    
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-question-circle me-2"></i>Available Quizzes</h2>
          </div>
        </div>
      </div>

      <div class="row" *ngIf="quizzes.length > 0">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let quiz of quizzes">
          <div class="card h-100 shadow-sm border-primary">
            <div class="card-header bg-primary text-white">
              <h6 class="card-title mb-0">{{ quiz.title }}</h6>
            </div>
            <div class="card-body">
              <p class="card-text text-muted">{{ quiz.description }}</p>
              
              <div class="mb-3">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="border-end">
                      <div class="h5 mb-0 text-primary">{{ quiz.duration }}</div>
                      <small class="text-muted">Minutes</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="border-end">
                      <div class="h5 mb-0 text-success">{{ quiz.totalMarks }}</div>
                      <small class="text-muted">Marks</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="h5 mb-0 text-info">{{ quiz.totalQuestions }}</div>
                    <small class="text-muted">Questions</small>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <small class="text-muted">
                  <i class="fas fa-calendar me-1"></i>
                  Available until: {{ quiz.endTime | date:'medium' }}
                </small>
              </div>

              <div class="mb-3">
                <small class="text-muted">
                  <i class="fas fa-user me-1"></i>
                  Created by: {{ quiz.createdByName }}
                </small>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <button 
                class="btn btn-primary w-100"
                (click)="startQuiz(quiz.id)"
                [disabled]="isQuizExpired(quiz)"
              >
                <i class="fas fa-play me-2"></i>
                {{ isQuizExpired(quiz) ? 'Expired' : 'Start Quiz' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="quizzes.length === 0" class="row">
        <div class="col-12">
          <div class="text-center py-5">
            <i class="fas fa-question-circle fa-4x text-muted mb-4"></i>
            <h4 class="text-muted">No Quizzes Available</h4>
            <p class="text-muted">There are no active quizzes at the moment. Please check back later.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;

  constructor(
    private quizService: QuizService,
    private authService: AauthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getAllActiveQuizzes().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.quizzes = response.data;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading quizzes:', error);
      }
    });
  }

  startQuiz(quizId: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.quizService.startQuiz(quizId, currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/quiz', quizId, 'take'], { 
            queryParams: { attemptId: response.data.id } 
          });
        }
      },
      error: (error) => {
        console.error('Error starting quiz:', error);
      }
    });
  }

  isQuizExpired(quiz: Quiz): boolean {
    return new Date(quiz.endTime) < new Date();
  }
}