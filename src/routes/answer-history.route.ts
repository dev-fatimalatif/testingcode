import { Router } from 'express';
import { AnswerHistoryController } from '@/controllers/answer-history.controller';
import { Routes } from '@interfaces/routes.interface';

export class AnswerHistoryRoute implements Routes {
  public path = '/answer-history';
  public router = Router();
  public answerHistoryController = new AnswerHistoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.answerHistoryController.getAllAnswerHistory);
    this.router.get(`${this.path}/:questionId`, this.answerHistoryController.getAnswerHistoryByQuestionId);
    this.router.post(`${this.path}`, this.answerHistoryController.createAnswerHistory);
  }
}
