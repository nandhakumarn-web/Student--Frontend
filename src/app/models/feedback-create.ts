import { FeedbackCategory } from "./feedback-category";

export interface FeedbackCreate {
  subject: string;
  message: string;
  category: FeedbackCategory;
  rating: number;
}
