import { QuestionsAnswersI } from '@/interfaces/questions-answers.interface';
import { model, Schema, Document } from 'mongoose';
const QuestionAnswer: Schema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
    },
    answerTitleCell: {
      //0,1,2.3
      type: Number,
      required: true,
    },
    rowHeader: {
      //row index of header
      //prompt original file and start from that row to fill answer
      type: Number,
      required: true,
    },
    answerScore: {
      type: Number,
    },
    scoreContext: {
      type: Schema.Types.Mixed,
    },
    customPrompt: {
      type: String,
    },
    markReviewed: {
      type: Boolean,
      required: true,
    },
    markCompleted: {
      type: Boolean,
      required: true,
    },
    sheetName: {
      type: String,
      required: true,
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }], //collaborator can be added on project level or on indvidu queston as well
    // createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { versionKey: false, timestamps: true },
);

export type QuestionAnswerTypo = QuestionsAnswersI & Document;

export const QuestionAnswerModel = model<QuestionAnswerTypo>('Questions-Answers', QuestionAnswer);
