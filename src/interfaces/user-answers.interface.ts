import mongoose from 'mongoose';

export interface UserAnswersI {
  _id?: string;
  answer: string;
  questionId: string;
  answerBy: string;
  answerScore: number;
}
