import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { QuizAttempt } from '../models/quiz-attempt';
import { SubmitQuiz } from '../models/submit-quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private apiUrl = 'http://localhost:8080/api/quiz';

  constructor(private http: HttpClient) {}

  // Create a new quiz
  createQuiz(quizData: any, teacherId: number): Observable<ApiResponse<Quiz>> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.post<ApiResponse<Quiz>>(`${this.apiUrl}/create`, quizData, { params });
  }

  getAllActiveQuizzes(): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.apiUrl}/all`);
  }

  getQuizzesByTeacher(teacherId: number): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(
      `${this.apiUrl}/teacher/${teacherId}`
    );
  }

  getQuizQuestions(
    quizId: number,
    studentId: number
  ): Observable<ApiResponse<Question[]>> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<ApiResponse<Question[]>>(
      `${this.apiUrl}/${quizId}/questions`,
      { params }
    );
  }

  startQuiz(
    quizId: number,
    studentId: number
  ): Observable<ApiResponse<QuizAttempt>> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.post<ApiResponse<QuizAttempt>>(
      `${this.apiUrl}/${quizId}/start`,
      {},
      { params }
    );
  }

  submitQuiz(
    submission: SubmitQuiz,
    studentId: number
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/submit`,
      submission,
      { params }
    );
  }

  getStudentQuizAttempts(
    studentId: number
  ): Observable<ApiResponse<QuizAttempt[]>> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(
      `${this.apiUrl}/attempts/student/${studentId}`
    );
  }

  getQuizResults(
    quizId: number,
    teacherId: number
  ): Observable<ApiResponse<QuizAttempt[]>> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.get<ApiResponse<QuizAttempt[]>>(
      `${this.apiUrl}/${quizId}/results`,
      { params }
    );
  }
}