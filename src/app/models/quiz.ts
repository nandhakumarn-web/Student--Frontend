export interface Quiz {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalMarks: number;
  isActive: boolean;
  createdByName: string;
  totalQuestions: number;
  createdAt: Date;
}
