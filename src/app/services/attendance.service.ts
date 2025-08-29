import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AttendanceCreate } from '../models/attendance-create';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Attendance } from '../models/attendance';
import { AttendanceStats } from '../models/attendance-stats';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

 private apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  markAttendance(attendance: AttendanceCreate, teacherId: number): Observable<ApiResponse<Attendance>> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.post<ApiResponse<Attendance>>(`${this.apiUrl}/mark`, attendance, { params });
  }

  markBulkAttendance(bulkAttendance: any, teacherId: number): Observable<ApiResponse<Attendance[]>> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.post<ApiResponse<Attendance[]>>(`${this.apiUrl}/bulk`, bulkAttendance, { params });
  }

  getStudentAttendance(studentId: number): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.apiUrl}/student/${studentId}`);
  }

  getStudentAttendanceStats(studentId: number): Observable<ApiResponse<AttendanceStats>> {
    return this.http.get<ApiResponse<AttendanceStats>>(`${this.apiUrl}/student/${studentId}/stats`);
  }

  getAttendanceByTeacher(teacherId: number): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  getAttendanceByDate(date: string): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.apiUrl}/date/${date}`);
  }
}