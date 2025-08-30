import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { QuizAttempt } from '../models/quiz-attempt';


export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8080/api/quiz'; // Update with your API URL

  constructor(private http: HttpClient) {}

  // Get all active quizzes
  getAllActiveQuizzes(): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.apiUrl}/quizzes/active`);
  }

  // Get quizzes created by a specific teacher
  getQuizzesByTeacher(teacherId: number): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.apiUrl}/quizzes/teacher/${teacherId}`);
  }

  // Create a new quiz
  createQuiz(quizData: any, teacherId: number): Observable<ApiResponse<Quiz>> {
    const payload = {
      ...quizData,
      teacherId: teacherId
    };
    return this.http.post<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes`, payload);
  }

  // Update an existing quiz
  updateQuiz(quizId: number, quizData: any): Observable<ApiResponse<Quiz>> {
    return this.http.put<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${quizId}`, quizData);
  }

  // Update quiz status (active/inactive)
  updateQuizStatus(quizId: number, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/quizzes/${quizId}/status`, { isActive });
  }

  // Delete a quiz
  deleteQuiz(quizId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/quizzes/${quizId}`);
  }

  // Get quiz questions for taking a quiz
  getQuizQuestions(quizId: number, studentId: number): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(`${this.apiUrl}/quizzes/${quizId}/questions?studentId=${studentId}`);
  }

  // Start a quiz attempt
  startQuiz(quizId: number, studentId: number): Observable<ApiResponse<QuizAttempt>> {
    return this.http.post<ApiResponse<QuizAttempt>>(`${this.apiUrl}/quiz-attempts/start`, {
      quizId,
      studentId
    });
  }

  // Submit quiz answers
  submitQuiz(submission: any, studentId: number): Observable<ApiResponse<any>> {
    const payload = {
      ...submission,
      studentId: studentId
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/quiz-attempts/submit`, payload);
  }

  // Get quiz results for a specific quiz
  getQuizResults(quizId: number, teacherId: number): Observable<ApiResponse<QuizAttempt[]>> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(`${this.apiUrl}/quizzes/${quizId}/results?teacherId=${teacherId}`);
  }

  // Get student's quiz attempts
  getStudentQuizAttempts(studentId: number): Observable<ApiResponse<QuizAttempt[]>> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(`${this.apiUrl}/students/${studentId}/quiz-attempts`);
  }

  // Get quiz attempt by ID
  getQuizAttempt(attemptId: number): Observable<ApiResponse<QuizAttempt>> {
    return this.http.get<ApiResponse<QuizAttempt>>(`${this.apiUrl}/quiz-attempts/${attemptId}`);
  }

  // Get quiz by ID
  getQuizById(quizId: number): Observable<ApiResponse<Quiz>> {
    return this.http.get<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${quizId}`);
  }

  // Get quiz statistics
  getQuizStatistics(quizId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/quizzes/${quizId}/statistics`);
  }

  // Get all quiz attempts (for admin)
  getAllQuizAttempts(): Observable<ApiResponse<QuizAttempt[]>> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(`${this.apiUrl}/quiz-attempts`);
  }

  // Bulk update quiz statuses
  bulkUpdateQuizStatus(quizIds: number[], isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/quizzes/bulk-status`, {
      quizIds,
      isActive
    });
  }

  // Export quiz results
  exportQuizResults(quizId: number, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/quizzes/${quizId}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Get quiz performance analytics
  getQuizAnalytics(quizId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/quizzes/${quizId}/analytics`);
  }

  // Duplicate a quiz
  duplicateQuiz(quizId: number, newTitle?: string): Observable<ApiResponse<Quiz>> {
    return this.http.post<ApiResponse<Quiz>>(`${this.apiUrl}/quizzes/${quizId}/duplicate`, {
      newTitle: newTitle || null
    });
  }

  // Get quiz templates
  getQuizTemplates(): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.apiUrl}/quiz-templates`);
  }

  // Create quiz from template
  createQuizFromTemplate(templateId: number, customizations: any): Observable<ApiResponse<Quiz>> {
    return this.http.post<ApiResponse<Quiz>>(`${this.apiUrl}/quiz-templates/${templateId}/create`, customizations);
  }

  // Auto-grade quiz (for objective questions)
  autoGradeQuiz(attemptId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/quiz-attempts/${attemptId}/auto-grade`, {});
  }

  // Manual grade quiz (for subjective questions)
  manualGradeQuiz(attemptId: number, grades: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/quiz-attempts/${attemptId}/manual-grade`, { grades });
  }

  // Get quiz leaderboard
  getQuizLeaderboard(quizId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/quizzes/${quizId}/leaderboard`);
  }
}