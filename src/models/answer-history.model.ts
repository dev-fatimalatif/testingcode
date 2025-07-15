import { Schema, model, Document } from 'mongoose';

const AnswerHistorySchema: Schema = new Schema(
  {
    answer: {
      type: String,
      required: true,
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: 'Questions-Answers',
      required: true,
    },
    customPrompt: {
      type: String,
    },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } } // Auto-create createdAt, no updates
);

export type AnswerHistoryTypo = Document & {
  answer: string;
  question_id: string;
  customPrompt?: string;
  createdAt: Date;
};

export const AnswerHistoryModel = model<AnswerHistoryTypo>('Answer-History', AnswerHistorySchema);
