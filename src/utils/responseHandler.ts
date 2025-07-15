import { Response } from 'express';

export const responseHandler = (res: Response, { statusCode, data, message = 'Success', success = true, error = undefined }) => {
  res.status(statusCode).json({ message, data, success, error });
};
