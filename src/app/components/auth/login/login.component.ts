import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AauthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  standalone: true,
  template: `
    <div class="container-fluid vh-100">
      <div class="row h-100">
        <div
          class="col-md-6 d-flex align-items-center justify-content-center bg-primary"
        >
          <div class="text-center text-white">
            <h1 class="display-4 mb-4">Welcome Back!</h1>
            <p class="lead">
              Sign in to continue to Educational Management System
            </p>
          </div>
        </div>
        <div class="col-md-6 d-flex align-items-center justify-content-center">
          <div class="w-100" style="max-width: 400px;">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <h2 class="card-title text-center mb-4">Login</h2>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="
                        loginForm.get('email')?.invalid &&
                        loginForm.get('email')?.touched
                      "
                    />
                    <div class="invalid-feedback">
                      Please provide a valid email.
                    </div>
                  </div>

                  <div class="mb-4">
                    <label for="password" class="form-label">Password</label>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      formControlName="password"
                      [class.is-invalid]="
                        loginForm.get('password')?.invalid &&
                        loginForm.get('password')?.touched
                      "
                    />
                    <div class="invalid-feedback">Password is required.</div>
                  </div>

                  <div class="alert alert-danger" *ngIf="errorMessage">
                    {{ errorMessage }}
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span
                      *ngIf="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                  </button>

                  <div class="text-center">
                    <p class="mb-0">
                      Don't have an account?
                      <a
                        routerLink="/register"
                        class="text-primary"
                        style="cursor: pointer;"
                        >Sign up here</a
                      >
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AauthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Login failed. Please try again.';
          console.error('Login error:', error);
        },
      });
    }
  }
}
