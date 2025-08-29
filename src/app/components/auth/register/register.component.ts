import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AauthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user-role';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-5 overflow-hidden vh-100">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <h2 class="card-title text-center mb-4">Create Account</h2>

              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="firstName"
                      formControlName="firstName"
                      [class.is-invalid]="
                        registerForm.get('firstName')?.invalid &&
                        registerForm.get('firstName')?.touched
                      "
                    />
                    <div class="invalid-feedback">First name is required.</div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="lastName"
                      formControlName="lastName"
                      [class.is-invalid]="
                        registerForm.get('lastName')?.invalid &&
                        registerForm.get('lastName')?.touched
                      "
                    />
                    <div class="invalid-feedback">Last name is required.</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [class.is-invalid]="
                      registerForm.get('email')?.invalid &&
                      registerForm.get('email')?.touched
                    "
                  />
                  <div class="invalid-feedback">
                    Please provide a valid email.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phoneNumber" class="form-label"
                    >Phone Number</label
                  >
                  <input
                    type="tel"
                    class="form-control"
                    id="phoneNumber"
                    formControlName="phoneNumber"
                    [class.is-invalid]="
                      registerForm.get('phoneNumber')?.invalid &&
                      registerForm.get('phoneNumber')?.touched
                    "
                  />
                  <div class="invalid-feedback">Phone number is required.</div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    formControlName="password"
                    [class.is-invalid]="
                      registerForm.get('password')?.invalid &&
                      registerForm.get('password')?.touched
                    "
                  />
                  <div class="invalid-feedback">
                    Password must be at least 8 characters.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="role" class="form-label">Role</label>
                  <select
                    class="form-select"
                    id="role"
                    formControlName="role"
                    (change)="onRoleChange()"
                    [class.is-invalid]="
                      registerForm.get('role')?.invalid &&
                      registerForm.get('role')?.touched
                    "
                  >
                    <option value="">Select Role</option>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                  <div class="invalid-feedback">Role is required.</div>
                </div>

                <!-- Student specific fields -->
                <div *ngIf="isStudent" class="border p-3 mb-3 rounded bg-light">
                  <h6 class="mb-3">Student Information</h6>

                  <div class="mb-3">
                    <label for="studentId" class="form-label">Student ID</label>
                    <input
                      type="text"
                      class="form-control"
                      id="studentId"
                      formControlName="studentId"
                    />
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="department" class="form-label"
                        >Department</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        id="department"
                        formControlName="department"
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="semester" class="form-label">Semester</label>
                      <select
                        class="form-select"
                        id="semester"
                        formControlName="semester"
                      >
                        <option value="">Select Batch</option>
                        <option value="1">1st Batch</option>
                        <option value="2">2nd Batch</option>
                        <option value="3">3rd Batch</option>
                        <option value="4">4th Batch</option>
                        <option value="5">5th Batch</option>
                        <option value="6">6th Batch</option>
                        <option value="7">7th Batch</option>
                        <option value="8">8th Batch</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  {{ errorMessage }}
                </div>

                <div class="alert alert-success" *ngIf="successMessage">
                  {{ successMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="registerForm.invalid || isLoading"
                >
                  <span
                    *ngIf="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>

                <div class="text-center mt-2">
                  <p class="mb-0">
                    Already have an account?
                    <a
                      routerLink="/login"
                      class="text-primary"
                      style="cursor: pointer;"
                      >Sign in here</a
                    >
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isStudent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AauthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      studentId: [''],
      department: [''],
      semester: [''],
    });
  }

  onRoleChange(): void {
    const role = this.registerForm.get('role')?.value;
    this.isStudent = role === UserRole.STUDENT;

    if (this.isStudent) {
      this.registerForm.get('studentId')?.setValidators(Validators.required);
      this.registerForm.get('department')?.setValidators(Validators.required);
      this.registerForm.get('semester')?.setValidators(Validators.required);
    } else {
      this.registerForm.get('studentId')?.clearValidators();
      this.registerForm.get('department')?.clearValidators();
      this.registerForm.get('semester')?.clearValidators();
    }

    this.registerForm.get('studentId')?.updateValueAndValidity();
    this.registerForm.get('department')?.updateValueAndValidity();
    this.registerForm.get('semester')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Account created successfully! Please login.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        },
      });
    }
  }
}
