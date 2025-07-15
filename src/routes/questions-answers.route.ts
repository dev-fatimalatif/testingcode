import { Router } from 'express';
import { QuestionAnswerController } from '@/controllers/questions-answers.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class QuestionAnswerRoute implements Routes {
  public path = '/questions-answers';
  public router = Router();
  public questionAnswer = new QuestionAnswerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
  
    this.router.get(`${this.path}/export-csv/:projectId`, this.questionAnswer.generateProjectQuestionAnswerSheet);

    this.router.put(`${this.path}/update-answer/:id`, this.questionAnswer.updateAnswer);
    this.router.get(`${this.path}/find-question-answer`, this.questionAnswer.findQuestionAnswer);
    
    this.router.post(`${this.path}`, this.questionAnswer.createQuestionAnswer);
    this.router.put(`${this.path}/assign-question-collaborators`, this.questionAnswer.assignCollaborators);
    this.router.put(`${this.path}/assign-sheet-collaborators`, this.questionAnswer.assignSheetCollaborators);
    this.router.get(`${this.path}/:projectId`, this.questionAnswer.getQuestionAnswerByProjectId);
    this.router.put(`${this.path}/:id`, this.questionAnswer.updateQuestionAnswer);
  }
}
