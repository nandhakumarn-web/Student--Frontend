import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';
import { UserRole } from '../models/user-role';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }

  getUsersByRole(role: UserRole): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/role/${role}`);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<ApiResponse<User>> {
    const params = new HttpParams().set('isActive', isActive.toString());
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}/status`, {}, { params });
  }
}