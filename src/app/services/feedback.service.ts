import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeedbackCreate } from '../models/feedback-create';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Feedback } from '../models/feedback';
import { FeedbackStatus } from '../models/feedback-status';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8080/api/feedback';

  constructor(private http: HttpClient) {}

  createFeedback(
    feedback: FeedbackCreate,
    studentId: number
  ): Observable<ApiResponse<Feedback>> {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.post<ApiResponse<Feedback>>(
      `${this.apiUrl}/create`,
      feedback,
      { params }
    );
  }

  getAllFeedback(): Observable<ApiResponse<Feedback[]>> {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.apiUrl}/all`);
  }

  getFeedbackByStudent(studentId: number): Observable<ApiResponse<Feedback[]>> {
    return this.http.get<ApiResponse<Feedback[]>>(
      `${this.apiUrl}/student/${studentId}`
    );
  }

  getFeedbackByStatus(
    status: FeedbackStatus
  ): Observable<ApiResponse<Feedback[]>> {
    return this.http.get<ApiResponse<Feedback[]>>(
      `${this.apiUrl}/status/${status}`
    );
  }

  updateFeedbackStatus(
    feedbackId: number,
    update: { status: FeedbackStatus; adminResponse?: string }
  ): Observable<ApiResponse<Feedback>> {
    return this.http.put<ApiResponse<Feedback>>(
      `${this.apiUrl}/${feedbackId}`,
      update
    );
  }
}
