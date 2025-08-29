import { AttendanceStatus } from "./attendance-status";

export interface AttendanceCreate {
  studentId: number;
  subject: string;
  attendanceDate: Date;
  status: AttendanceStatus;
  remarks?: string;
}
