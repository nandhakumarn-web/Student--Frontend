import { UserRole } from "./user-role";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  studentId?: string;
  department?: string;
  semester?: number;
}
