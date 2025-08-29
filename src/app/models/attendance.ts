import { AttendanceStatus } from "./attendance-status";

export interface Attendance {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  attendanceDate: Date;
  status: AttendanceStatus;
  remarks?: string;
  teacherName: string;
  createdAt: Date;
}
