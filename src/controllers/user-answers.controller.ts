import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { UserAnswerService } from '@/services/user-answers.service';
import { UserAnswersI } from '@/interfaces/user-answers.interface';

export class UserAnswerController {
  public UserAnswer = Container.get(UserAnswerService);

  public getUserAnswers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUserAnswersData: UserAnswersI[] = await this.UserAnswer.findUserAnswerByProjectId();

      responseHandler(res, { data: findAllUserAnswersData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getUserAnswerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserAnswerId: string = req.params.id;
      const findOneUserAnswerData: UserAnswersI = await this.UserAnswer.findUserAnswerByProjectId(undefined);

      responseHandler(res, { data: findOneUserAnswerData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createMultiUserAnswers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserAnswerData: UserAnswersI[] = req.body;
      const data = await this.UserAnswer.createMultiUserAnswers(UserAnswerData);

      responseHandler(res, { data, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateUserAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserAnswerId: string = req.params.id;
      const UserAnswerData: UserAnswersI = req.body;
      const updateUserAnswerData: UserAnswersI = await this.UserAnswer.updateUserAnswer(UserAnswerId, UserAnswerData);

      responseHandler(res, { data: updateUserAnswerData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteUserAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserAnswerId: string = req.params.id;
      const deleteUserAnswerData: UserAnswersI = await this.UserAnswer.deleteUserAnswer(UserAnswerId);

      responseHandler(res, { data: deleteUserAnswerData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
