import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../../models/question';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { AauthService } from '../../services/auth.service';
import { AnswerSubmission } from '../../models/answer-submission';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule,FormsModule],
 template: `
    <div class="container-fluid py-4" *ngIf="!loading">
      <!-- Quiz Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-1">{{ quizTitle }}</h4>
                  <p class="mb-0">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
                <div class="text-end">
                  <div class="h4 mb-0">{{ formatTime(timeRemaining) }}</div>
                  <small>Time Remaining</small>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="progress mt-3" style="height: 8px;">
                <div 
                  class="progress-bar bg-warning" 
                  [style.width.%]="(currentQuestionIndex + 1) / questions.length * 100"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="row" *ngIf="currentQuestion">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <span class="badge bg-primary me-2">{{ currentQuestion.marks }} marks</span>
                  Question {{ currentQuestionIndex + 1 }}
                </h5>
                                  <div class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatTime(questionTimeRemaining) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="question-text">{{ currentQuestion.questionText }}</h6>
              </div>

              <!-- Options -->
              <div class="row">
                <div class="col-12">
                  <div *ngFor="let option of currentQuestion.options; let i = index" class="mb-3">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        [name]="'question_' + currentQuestion.id"
                        [id]="'option_' + i"
                        [value]="i"
                        [(ngModel)]="selectedAnswers[currentQuestion.id]"
                      >
                      <label class="form-check-label w-100" [for]="'option_' + i">
                        <div class="p-3 border rounded option-card">
                          <strong>{{ String.fromCharCode(65 + i) }}.</strong> {{ option.text }}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="d-flex justify-content-between">
                <button 
                  class="btn btn-secondary"
                  (click)="previousQuestion()"
                  [disabled]="currentQuestionIndex === 0"
                >
                  <i class="fas fa-arrow-left me-2"></i>Previous
                </button>

                <div>
                  <button 
                    class="btn btn-warning me-2"
                    (click)="nextQuestion()"
                    *ngIf="currentQuestionIndex < questions.length - 1"
                  >
                    Next<i class="fas fa-arrow-right ms-2"></i>
                  </button>

                  <button 
                    class="btn btn-success"
                    (click)="submitQuiz()"
                    *ngIf="currentQuestionIndex === questions.length - 1"
                  >
                    <i class="fas fa-check me-2"></i>Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Navigation -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Question Navigation</h6>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <button
                  *ngFor="let question of questions; let i = index"
                  class="btn btn-sm"
                  [ngClass]="{
                    'btn-primary': i === currentQuestionIndex,
                    'btn-success': i !== currentQuestionIndex && selectedAnswers[question.id] !== undefined,
                    'btn-outline-secondary': i !== currentQuestionIndex && selectedAnswers[question.id] === undefined
                  }"
                  (click)="goToQuestion(i)"
                >
                  {{ i + 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="container-fluid py-5">
      <div class="text-center">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3">Loading quiz...</p>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div class="modal fade" id="submitModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Submit Quiz</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to submit this quiz?</p>
            <div class="alert alert-warning">
              <strong>Warning:</strong> You have answered {{ getAnsweredCount() }} out of {{ questions.length }} questions.
              You cannot change your answers after submission.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" (click)="confirmSubmit()" data-bs-dismiss="modal">
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .option-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .option-card:hover {
      background-color: #f8f9fa;
      border-color: #007bff !important;
    }
    .form-check-input:checked ~ .form-check-label .option-card {
      background-color: #e3f2fd;
      border-color: #007bff !important;
    }
    .question-text {
      font-size: 1.1rem;
      line-height: 1.6;
    }
  `]
})
export class QuizTakeComponent implements OnInit, OnDestroy {
  loading = true;
  quizId!: number;
  attemptId!: number;
  quizTitle = '';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: { [questionId: number]: number } = {};
  timeRemaining = 0; // in seconds
  questionTimeRemaining = 0;
  
  private timerSubscription?: Subscription;
  private questionTimerSubscription?: Subscription;
String: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private authService: AauthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizId = +params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.attemptId = +params['attemptId'];
    });

    this.loadQuizQuestions();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.questionTimerSubscription) {
      this.questionTimerSubscription.unsubscribe();
    }
  }

  loadQuizQuestions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.quizService.getQuizQuestions(this.quizId, currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.questions = response.data;
          this.loading = false;
          this.startTimer();
          this.startQuestionTimer();
        }
      },
      error: (error) => {
        console.error('Error loading quiz questions:', error);
        this.loading = false;
      }
    });
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  startTimer(): void {
    // Assume 30 minutes for now - you should get this from quiz data
    this.timeRemaining = 30 * 60;
    
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.autoSubmitQuiz();
      }
    });
  }

  startQuestionTimer(): void {
    if (this.currentQuestion) {
      this.questionTimeRemaining = this.currentQuestion.timeLimitSeconds;
      
      this.questionTimerSubscription = interval(1000).subscribe(() => {
        this.questionTimeRemaining--;
        if (this.questionTimeRemaining <= 0) {
          this.nextQuestion();
        }
      });
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.resetQuestionTimer();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.resetQuestionTimer();
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    this.resetQuestionTimer();
  }

  resetQuestionTimer(): void {
    if (this.questionTimerSubscription) {
      this.questionTimerSubscription.unsubscribe();
    }
    this.startQuestionTimer();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getAnsweredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  submitQuiz(): void {
    // Show confirmation modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('submitModal'));
    modal.show();
  }

  confirmSubmit(): void {
    this.performSubmit();
  }

  autoSubmitQuiz(): void {
    this.performSubmit();
  }

  performSubmit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const answers: AnswerSubmission[] = Object.keys(this.selectedAnswers).map(questionId => ({
      questionId: +questionId,
      selectedOptionIndex: this.selectedAnswers[+questionId]
    }));

    const submission = {
      quizId: this.quizId,
      answers
    };

    this.quizService.submitQuiz(submission, currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/quiz/result'], { 
            queryParams: { attemptId: this.attemptId } 
          });
        }
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
      }
    });
  }
}
