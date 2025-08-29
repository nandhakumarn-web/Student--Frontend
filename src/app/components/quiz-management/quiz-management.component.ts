import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Quiz } from '../../models/quiz';
import { QuizAttempt } from '../../models/quiz-attempt';
import { QuizService } from '../../services/quiz.service';
import { AauthService } from '../../services/auth.service';
import { UserRole } from '../../models/user-role';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-management',
  imports: [NavbarComponent, CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true, 
  template: `
    <app-navbar></app-navbar>
    
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h2><i class="fas fa-cogs me-2"></i>Quiz Management</h2>
            <button 
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#createQuizModal"
            >
              <i class="fas fa-plus me-2"></i>Create Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- My Quizzes -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">My Quizzes</h5>
            </div>
            <div class="card-body">
              <div *ngIf="myQuizzes.length === 0" class="text-center py-4">
                <i class="fas fa-question-circle fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No quizzes created yet</h5>
                <p class="text-muted">Create your first quiz to get started.</p>
              </div>

              <div class="table-responsive" *ngIf="myQuizzes.length > 0">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Total Marks</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let quiz of myQuizzes">
                      <td>
                        <strong>{{ quiz.title }}</strong>
                        <br>
                        <small class="text-muted">{{ quiz.description }}</small>
                      </td>
                      <td>{{ quiz.duration }} min</td>
                      <td>{{ quiz.totalMarks }}</td>
                      <td>{{ quiz.totalQuestions }}</td>
                      <td>
                        <span class="badge" [ngClass]="quiz.isActive ? 'bg-success' : 'bg-secondary'">
                          {{ quiz.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ quiz.startTime | date:'medium' }}</td>
                      <td>{{ quiz.endTime | date:'medium' }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-info"
                            (click)="viewQuizResults(quiz)"
                            title="View Results"
                          >
                            <i class="fas fa-chart-bar"></i>
                          </button>
                          <button 
                            class="btn btn-outline-primary"
                            (click)="editQuiz(quiz)"
                            title="Edit Quiz"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            class="btn btn-outline-secondary"
                            (click)="toggleQuizStatus(quiz)"
                            title="Toggle Status"
                          >
                            <i class="fas" [class.fa-play]="!quiz.isActive" [class.fa-pause]="quiz.isActive"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Results -->
      <div class="row" *ngIf="selectedQuizResults.length > 0">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Quiz Results: {{ selectedQuizTitle }}</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Correct Answers</th>
                      <th>Total Questions</th>
                      <th>Started At</th>
                      <th>Submitted At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let result of selectedQuizResults">
                      <td>{{ result.studentName }}</td>
                      <td>{{ result.scoreObtained || 0 }} / {{ getTotalMarks(result) }}</td>
                      <td>
                        <div class="progress" style="height: 20px;">
                          <div 
                            class="progress-bar" 
                            [class.bg-success]="getPercentage(result) >= 70"
                            [class.bg-warning]="getPercentage(result) >= 50 && getPercentage(result) < 70"
                            [class.bg-danger]="getPercentage(result) < 50"
                            [style.width.%]="getPercentage(result)"
                          >
                            {{ getPercentage(result) | number:'1.1-1' }}%
                          </div>
                        </div>
                      </td>
                      <td>{{ result.correctAnswers || 0 }}</td>
                      <td>{{ result.totalQuestions }}</td>
                      <td>{{ result.startedAt | date:'medium' }}</td>
                      <td>{{ result.submittedAt | date:'medium' }}</td>
                      <td>
                        <span class="badge" [ngClass]="result.isCompleted ? 'bg-success' : 'bg-warning'">
                          {{ result.isCompleted ? 'Completed' : 'In Progress' }}
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

    <!-- Create Quiz Modal -->
    <div class="modal fade" id="createQuizModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Quiz</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="quizForm" (ngSubmit)="createQuiz()">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <!-- Basic Quiz Info -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label for="title" class="form-label">Quiz Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    formControlName="title"
                    [class.is-invalid]="quizForm.get('title')?.invalid && quizForm.get('title')?.touched"
                  >
                  <div class="invalid-feedback">Title is required.</div>
                </div>
                
                <div class="col-md-6">
                  <label for="duration" class="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    class="form-control"
                    id="duration"
                    formControlName="duration"
                    min="1"
                    [class.is-invalid]="quizForm.get('duration')?.invalid && quizForm.get('duration')?.touched"
                  >
                  <div class="invalid-feedback">Duration must be at least 1 minute.</div>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-12">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    formControlName="description"
                  ></textarea>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-6">
                  <label for="startTime" class="form-label">Start Time</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    id="startTime"
                    formControlName="startTime"
                    [class.is-invalid]="quizForm.get('startTime')?.invalid && quizForm.get('startTime')?.touched"
                  >
                  <div class="invalid-feedback">Start time is required.</div>
                </div>
                
                <div class="col-md-6">
                  <label for="endTime" class="form-label">End Time</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    id="endTime"
                    formControlName="endTime"
                    [class.is-invalid]="quizForm.get('endTime')?.invalid && quizForm.get('endTime')?.touched"
                  >
                  <div class="invalid-feedback">End time is required.</div>
                </div>
              </div>

              <!-- Questions Section -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6>Questions</h6>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addQuestion()">
                    <i class="fas fa-plus me-1"></i>Add Question
                  </button>
                </div>

                <div formArrayName="questions">
                  <div *ngFor="let question of questions.controls; let i = index" class="card mb-3">
                    <div class="card-header">
                      <div class="d-flex justify-content-between align-items-center">
                        <span>Question {{ i + 1 }}</span>
                        <button 
                          type="button" 
                          class="btn btn-sm btn-outline-danger"
                          (click)="removeQuestion(i)"
                          *ngIf="questions.length > 1"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="card-body">
                      <div [formGroupName]="i">
                        <div class="row mb-3">
                          <div class="col-md-8">
                            <label class="form-label">Question Text</label>
                            <textarea
                              class="form-control"
                              formControlName="questionText"
                              rows="2"
                              [class.is-invalid]="question.get('questionText')?.invalid && question.get('questionText')?.touched"
                            ></textarea>
                            <div class="invalid-feedback">Question text is required.</div>
                          </div>
                          <div class="col-md-2">
                            <label class="form-label">Time Limit (sec)</label>
                            <input
                              type="number"
                              class="form-control"
                              formControlName="timeLimitSeconds"
                              min="10"
                              [class.is-invalid]="question.get('timeLimitSeconds')?.invalid && question.get('timeLimitSeconds')?.touched"
                            >
                            <div class="invalid-feedback">Min 10 seconds.</div>
                          </div>
                          <div class="col-md-2">
                            <label class="form-label">Marks</label>
                            <input
                              type="number"
                              class="form-control"
                              formControlName="marks"
                              min="1"
                              [class.is-invalid]="question.get('marks')?.invalid && question.get('marks')?.touched"
                            >
                            <div class="invalid-feedback">Min 1 mark.</div>
                          </div>
                        </div>

                        <!-- Options -->
                        <div class="mb-3">
                          <label class="form-label">Options</label>
                          <div formArrayName="options">
                            <div *ngFor="let option of getOptions(i).controls; let j = index" class="input-group mb-2">
                              <span class="input-group-text">{{ String.fromCharCode(65 + j) }}</span>
                              <div [formGroupName]="j">
                                <input
                                  type="text"
                                  class="form-control"
                                  formControlName="text"
                                  [placeholder]="'Option ' + String.fromCharCode(65 + j)"
                                  [class.is-invalid]="option.get('text')?.invalid && option.get('text')?.touched"
                                >
                              </div>
                              <div class="input-group-text">
                                <input
                                  type="radio"
                                  [name]="'correct_' + i"
                                  [value]="j"
                                  (change)="setCorrectOption(i, j)"
                                  title="Mark as correct answer"
                                >
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="mb-3">
                          <label class="form-label">Correct Answer</label>
                          <select
                            class="form-select"
                            formControlName="correctOptionIndex"
                            [class.is-invalid]="question.get('correctOptionIndex')?.invalid && question.get('correctOptionIndex')?.touched"
                          >
                            <option value="">Select correct answer</option>
                            <option [value]="j" *ngFor="let option of getOptions(i).controls; let j = index">
                              Option {{ String.fromCharCode(65 + j) }}
                            </option>
                          </select>
                          <div class="invalid-feedback">Please select the correct answer.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <div class="me-auto">
                <small class="text-muted">Total Marks: {{ calculateTotalMarks() }}</small>
              </div>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="quizForm.invalid || isCreating"
              >
                <span *ngIf="isCreating" class="spinner-border spinner-border-sm me-2"></span>
                {{ isCreating ? 'Creating...' : 'Create Quiz' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress {
      position: relative;
    }
    .progress .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .card-header {
      background-color: #f8f9fa;
    }
    .input-group-text input[type="radio"] {
      margin: 0;
    }
  `]
})
export class QuizManagementComponent implements OnInit {
  quizForm: FormGroup;
  myQuizzes: Quiz[] = [];
  selectedQuizResults: QuizAttempt[] = [];
  selectedQuizTitle = '';
  isCreating = false;
  String = String;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private authService: AauthService,
    private router: Router
  ) {
    this.quizForm = this.createQuizForm();
  }

  ngOnInit(): void {
    this.loadMyQuizzes();
  }

  createQuizForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      totalMarks: [0],
      questions: this.fb.array([this.createQuestionForm()])
    });
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      questionText: ['', Validators.required],
      timeLimitSeconds: [30, [Validators.required, Validators.min(10)]],
      marks: [1, [Validators.required, Validators.min(1)]],
      correctOptionIndex: ['', Validators.required],
      options: this.fb.array([
        this.createOptionForm(0),
        this.createOptionForm(1),
        this.createOptionForm(2),
        this.createOptionForm(3)
      ])
    });
  }

  createOptionForm(index: number): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      index: [index]
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionForm());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  setCorrectOption(questionIndex: number, optionIndex: number): void {
    this.questions.at(questionIndex).get('correctOptionIndex')?.setValue(optionIndex);
  }

  calculateTotalMarks(): number {
    let total = 0;
    this.questions.controls.forEach(question => {
      const marks = question.get('marks')?.value || 0;
      total += parseInt(marks);
    });
    this.quizForm.get('totalMarks')?.setValue(total);
    return total;
  }

  loadMyQuizzes(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.quizService.getQuizzesByTeacher(currentUser.id).subscribe(response => {
      if (response.success) {
        this.myQuizzes = response.data;
      }
    });
  }

  createQuiz(): void {
    if (this.quizForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;

      this.isCreating = true;
      const quizData = {
        ...this.quizForm.value,
        totalMarks: this.calculateTotalMarks()
      };

      this.quizService.createQuiz(quizData, currentUser.id).subscribe({
        next: (response) => {
          this.isCreating = false;
          if (response.success) {
            this.quizForm = this.createQuizForm();
            this.loadMyQuizzes();
            // Close modal
            const modal = document.getElementById('createQuizModal');
            if (modal) {
              const bsModal = new (window as any).bootstrap.Modal(modal);
              bsModal.hide();
            }
          }
        },
        error: (error) => {
          this.isCreating = false;
          console.error('Error creating quiz:', error);
        }
      });
    }
  }

  viewQuizResults(quiz: Quiz): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.selectedQuizTitle = quiz.title;
    this.quizService.getQuizResults(quiz.id, currentUser.id).subscribe(response => {
      if (response.success) {
        this.selectedQuizResults = response.data;
      }
    });
  }

  editQuiz(quiz: Quiz): void {
    // Navigate to edit page or open edit modal
    console.log('Edit quiz:', quiz);
  }

  toggleQuizStatus(quiz: Quiz): void {
    // Toggle quiz active status
    console.log('Toggle quiz status:', quiz);
  }

  getTotalMarks(result: QuizAttempt): number {
    return result.totalQuestions * 5; // Assuming 5 marks per question
  }

  getPercentage(result: QuizAttempt): number {
    if (!result.scoreObtained || result.totalQuestions === 0) return 0;
    return (result.scoreObtained / this.getTotalMarks(result)) * 100;
  }

  isTeacher(): boolean {
    return this.authService.hasRole(UserRole.TEACHER);
  }

  isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }
}