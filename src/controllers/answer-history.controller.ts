import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { AnswerHistoryService } from '@/services/answer-history.service';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class AnswerHistoryController {
  public answerHistoryService = new AnswerHistoryService();

  /**
   * GET: Fetch all answer history records.
   */
  
  public getAllAnswerHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const answerHistoryData = await this.answerHistoryService.getAllAnswerHistory();
      responseHandler(res, { data: answerHistoryData, message: 'Fetched answer history', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET: Fetch answer history by Question ID.
   */
  public getAnswerHistoryByQuestionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;
      const answerHistoryData = await this.answerHistoryService.getAnswerHistoryByQuestionId(questionId);
      responseHandler(res, { data: answerHistoryData, message: 'Fetched answer history by question', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST: Create a new answer history record.
   */
  public createAnswerHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, question_id, customPrompt } = req.body;

      if (!answer || !question_id) {
        return next(new HttpException(HttpStatus.BAD_REQUEST, 'Answer and Question ID are required'));
      }

      const newAnswerHistory = await this.answerHistoryService.createAnswerHistory({ answer, question_id, customPrompt });
      responseHandler(res, { data: newAnswerHistory, message: 'Answer history created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };
}
