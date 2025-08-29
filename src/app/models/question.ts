import { Option } from "./option";

export interface Question {
  id: number;
  questionText: string;
  timeLimitSeconds: number;
  marks: number;
  options: Option[];
}
