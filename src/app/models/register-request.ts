import { UserRole } from "./user-role";

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  semester?: number;
}
