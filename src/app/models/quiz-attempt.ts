export interface QuizAttempt {
  id: number;
  quizId: number;
  quizTitle: string;
  startedAt: Date;
  submittedAt?: Date;
  scoreObtained?: number;
  totalQuestions: number;
  correctAnswers?: number;
  isCompleted: boolean;
  studentName: string;
}
