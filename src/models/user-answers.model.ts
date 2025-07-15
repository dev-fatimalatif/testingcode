import { UserAnswersI } from '@/interfaces/user-answers.interface';
import { model, Schema, Document } from 'mongoose';
const UserAnswer: Schema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Questions-Answers' },
    answerBy: { type: Schema.Types.ObjectId, ref: 'User' }, //collaborator can be added on project level or on indvidu queston as well
    answer: {
      type: String,
      required: true,
    },
    answerScore: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true },
);

export type UserAnswerTypo = UserAnswersI & Document;

export const UserAnswerModel = model<UserAnswerTypo>('User-Answers', UserAnswer);
