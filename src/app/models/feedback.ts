import { FeedbackCategory } from "./feedback-category";
import { FeedbackStatus } from "./feedback-status";

export interface Feedback {
  id: number;
  studentName: string;
  subject: string;
  message: string;
  category: FeedbackCategory;
  rating: number;
  status: FeedbackStatus;
  adminResponse?: string;
  createdAt: Date;
  respondedAt?: Date;
}
