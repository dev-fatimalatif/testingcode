import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';

export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message: string = error.message || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

    responseHandler(res, { message, success: false, statusCode: status, data: null });
  } catch (error) {
    next(error);
  }
};

export const tryCatchHandler = func => (req: Request, res: Response, next: NextFunction) => Promise.resolve(func(req, res, next)).catch(next);
