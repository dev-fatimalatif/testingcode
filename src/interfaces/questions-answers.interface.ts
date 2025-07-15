import mongoose from 'mongoose';

export interface QuestionsAnswersI {
  _id: string;
  question: string;
  answer: string;
  answerTitleCell: number;
  customPrompt?: string;
  markReviewed: boolean;
  markCompleted: boolean;
  sheetName: string;
  project?: string;
  collaborators: Array<mongoose.Types.ObjectId>;

  answerScore: number;
  scoreContext: any;

  isCollaborator?: boolean;
}

export type AssignQuestionCollaboratorI = Pick<QuestionsAnswersI, 'collaborators' | '_id'>;

export interface AssignSheetCollaboratorI {
  projectId: string;
  sheetName: string;
  collaborators: Array<{ _id: string; action: 'add' | 'remove' }>;
}

export interface NewQuestionAnswerPayloadI {
  payload: Record<string, QuestionsAnswersI[]>;
  answerTitleCell: Record<string, number>;
  rowHeaderIndex: Record<string, number>;
}

export type QuestionAnswerPayloadI = Record<string, QuestionsAnswersI[]>;
