import { AnswerSubmission } from "./answer-submission";

export interface SubmitQuiz {
  quizId: number;
  answers: AnswerSubmission[];
}
