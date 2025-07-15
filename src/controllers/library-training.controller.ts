import HttpStatus from '@/constants/HttpStatus';
import { HttpException } from '@/exceptions/HttpException';
import { LibraryTrainingService } from '@/services/library-training.service';
import { responseHandler } from '@/utils/responseHandler';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';


export class LibraryTrainingController {

    public LibraryTraining = Container.get(LibraryTrainingService);


    public createLibraryTraining = async (req: Request, res: Response, next: NextFunction) => {

        try {
            // Extract token from req.user
            console.log("--------");
            console.log(req.cookies.accessToken, 'req hello pop up');
            console.log("--------");
      const token = (req.cookies.accessToken as any); // Get token from incoming request
      if (!token) {
        return next(new HttpException(HttpStatus.UNAUTHORIZED, "Access token missing"));
      }
            const trainLibraryData: any = await this.LibraryTraining.libraryDataTraining(token, req.body);

            responseHandler(res, { data: trainLibraryData, message: 'data feed to fast api', statusCode: HttpStatus.OK });
        } catch (error) {
          next(error);
        }
      };

}