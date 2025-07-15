import { Router } from 'express';
import { userAnswerController } from '@/controllers/questions-answers.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { UserAnswerController } from '@/controllers/user-answers.controller';

export class UserAnswerRoute implements Routes {
  public path = '/users-answers';
  public router = Router();
  public userAnswer = new UserAnswerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    // this.router.get(`${this.path}/:projectId`, this.userAnswer.getuserAnswerByProjectId);
    // this.router.get(`${this.path}/export-csv/:projectId`, this.userAnswer.generateProjectuserAnswerSheet);

    this.router.post(`${this.path}/mutiple`, this.userAnswer.createMultiUserAnswers);
    // this.router.post(`${this.path}`, this.userAnswer.crea);
  }
}
