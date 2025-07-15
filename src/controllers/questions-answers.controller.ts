import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { QuestionAnswerService } from '@/services/questions-answers.service';
import {
  AssignQuestionCollaboratorI,
  AssignSheetCollaboratorI,
  NewQuestionAnswerPayloadI,
  QuestionAnswerPayloadI,
  QuestionsAnswersI,
} from '@/interfaces/questions-answers.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ExcelService } from '@/services/excel.service';
import { ProjectService } from '@/services/projects.service';
import { ProjectI } from '@/interfaces/projects.interface';
import { UserAnswersI } from '@/interfaces/user-answers.interface';
import { UserAnswerService } from '@/services/user-answers.service';
import { QuestionAnswerModel } from '@/models/question-answers.model';

export class QuestionAnswerController {
  public questionAnswer = Container.get(QuestionAnswerService);
  public project = Container.get(ProjectService);
  public UserAnswer = Container.get(UserAnswerService);

  public excelFileService = Container.get(ExcelService);

  // public getQuestionAnswers = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const currentPage = parseInt(req.query?.currentPage as string) || 1;
  //     const pageSize = parseInt(req.query?.pageSize as string) || 10;

  //     const sortBy = req.query?.sortBy ?? 'asc';
  //     const sortColumn = (req.query?.sortColumn as string) ?? 'name';

  //     const findAllQuestionAnswersData: QuestionAnswerListI = await this.questionAnswer.findAllQuestionAnswer({
  //       ...req.query,
  //       currentPage,
  //       limit: pageSize,
  //       sortColumn,
  //       sortby: 'descending'.includes((sortBy as string).toLowerCase()) ? -1 : 1,
  //     });
  //     responseHandler(res, { data: findAllQuestionAnswersData, message: 'findAll', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  private groupByQuestionAnswerBySheet = (data: QuestionsAnswersI[]) => {
    return data.reduce((prev, curr) => {
      if (!Array.isArray(prev[curr.sheetName])) {
        prev[curr.sheetName] = [curr];
      } else {
        prev[curr.sheetName].push(curr);
      }
      return prev;
    }, {});
  };

  public findQuestionAnswer = async (req: Request, res: Response, next: NextFunction) => {
    const { text } = req.query; // Extract 'text' from query parameters
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Search text is required');
      }
  
      const findOneQuestionAnswerData: QuestionsAnswersI[] = await this.questionAnswer.findQuestionAnswer(text);
  
      responseHandler(res, {
        data: findOneQuestionAnswerData,
        message: 'findOne',
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  
  // public updateAnswer= async (req: Request, res: Response, next: NextFunction) => {
  //   const questionAnswerDataId = req.params.id;
  //   const AnswerData: QuestionsAnswersI = req.body;
  //   console.log(req.user,"oopp098");
  //   try {
  //     const updateAnswerData: QuestionsAnswersI = await this.questionAnswer.updateAnswer(questionAnswerDataId, AnswerData);
  //     responseHandler(res, { data: updateAnswerData, message: 'answer-updated', statusCode: HttpStatus.CREATED });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public updateAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionAnswerDataId = req.params.id;
      // The payload is a single Answer object (not a list)
      const answerData: QuestionsAnswersI = req.body;
      
      // Check if this is a collaborator update
      if (answerData.isCollaborator) {
        // Build the collaborator payload for the UserAnswer collection
        const userAnswerData: UserAnswersI = {
          questionId: questionAnswerDataId,
          answerBy: req.user._id, // Make sure req.user is set by your auth middleware
          answer: answerData.answer,
          answerScore: answerData.answerScore,
          // Optionally add any other fields if necessary
        };
  
        // Use bulk upsert with a single element (object wrapped in an array)
        await this.UserAnswer.CreateUpdateMultiUsersAnswers([userAnswerData]);
  
        return responseHandler(res, {
          data: answerData,
          message: 'Collaborator answer updated',
          statusCode: HttpStatus.CREATED,
        });
      } else {
        // Admin update: update the main question answer document
        const updatedQuestionAnswer = await QuestionAnswerModel.findOneAndUpdate(
          { _id: questionAnswerDataId },
          {
            $set: {
              answer: answerData.answer,
              customPrompt: answerData.customPrompt,
              markReviewed: answerData.markReviewed,
              markCompleted: answerData.markCompleted,
              answerScore: answerData.answerScore,
              scoreContext: answerData.scoreContext,
              updatedAt: new Date(),
            },
          },
          { new: true } // Return the updated document
        );
  
        if (!updatedQuestionAnswer) {
          throw new HttpException(
            HttpStatus.NOT_FOUND,
            "Question Answer not found or could not be updated"
          );
        }
  
        return responseHandler(res, {
          data: updatedQuestionAnswer,
          message: 'Answer updated',
          statusCode: HttpStatus.CREATED,
        });
      }
    } catch (error) {
      next(error);
    }
  };
//----------------------------------------------  

  public getQuestionAnswerByProjectId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.projectId;
      const text: string = req.query.text ? req.query.text : '';
console.log(text,"hello123400");
      const findOneQuestionAnswerData: QuestionsAnswersI[] = await this.questionAnswer.findQuestionAnswerByProjectId(projectId, req.user,text);

      const groupByResponse = this.groupByQuestionAnswerBySheet(findOneQuestionAnswerData);

      responseHandler(res, { data: groupByResponse, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      if (error.name === 'CastError' && error.path === 'project') {
        next(new HttpException(HttpStatus.BAD_REQUEST, "Question Answer doesn't exist"));
        return;
      }
      next(error);
    }
  };

  public generateProjectQuestionAnswerSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.projectId;
      const findOneQuestionAnswerData: QuestionsAnswersI[] = await this.questionAnswer.findQuestionAnswerByProjectId(projectId, req.user, '');

      const findProject: ProjectI = await this.project.findProjectById(projectId);
      const groupByResponse = findOneQuestionAnswerData.reduce((prev, curr) => {
        if (!Array.isArray(prev[curr.sheetName])) {
          prev[curr.sheetName] = [];
        }
        const { _id, project, createdAt, updatedAt, sheetName, ...record } = { ...curr };

        prev[curr.sheetName].push({ ...record, customPrompt: record?.customPrompt || findProject?.prompt });
        return prev;
      }, {});

      const excelBuffer = await this.excelFileService.writeExcelFile(groupByResponse, findProject.rfpFile);

      //Set headers to download the file
      res.setHeader('Content-Disposition', `attachment; filename=${findProject.name}-${Date.now()}-v1.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose the Content-Disposition header
      res.send(excelBuffer);
    } catch (error) {
      if (error.name === 'CastError' && error.path === 'project') {
        next(new HttpException(HttpStatus.BAD_REQUEST, "Question Answer doesn't exist"));
        return;
      }
      next(error);
    }
  };

  private getAnswerString = (answer: any) => {
    return Array.isArray((answer as unknown as any)?.ops) ? (answer as unknown as any)?.ops?.[0]?.insert : answer;
  };

  public createQuestionAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { payload, answerTitleCell, rowHeaderIndex } = req.body as NewQuestionAnswerPayloadI;
      const mapPayload: QuestionsAnswersI[] = Object.entries(payload).reduce((prev, [key, value]) => {
        const list = value.map(record => ({
          ...record,
          answer: this.getAnswerString(record.answer),
          sheetName: key,
          answerTitleCell: answerTitleCell[key],
          rowHeader: rowHeaderIndex?.[key] ?? 0,
        }));
        prev = [...prev, ...list];
        return prev;
      }, []);

      const createQuestionAnswerData: QuestionsAnswersI[] = await this.questionAnswer.createQuestionAnswer(mapPayload);

      // const userAnswersPayload: UserAnswersI[] = createQuestionAnswerData.map(({ _id: questionId, answer, answerBy }) => ({
      //   questionId,
      //   answer,
      //   answerBy,
      // }));

      // await this.UserAnswer.createMultiUserAnswers(userAnswersPayload);

      const groupByResponse = this.groupByQuestionAnswerBySheet(createQuestionAnswerData);

      responseHandler(res, { data: groupByResponse, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateQuestionAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.id;

      const questionAnswerData: QuestionAnswerPayloadI = req.body;

      //check current user exist in quetion coll or in project colla
      const mapPayload: QuestionsAnswersI[] = Object.entries(questionAnswerData).reduce((prev, [key, value]) => {
        const list = value.map(record => ({ ...record, sheetName: key, answer: this.getAnswerString(record.answer) }));
        prev = [...prev, ...list];
        return prev;
      }, []);


      //frontend if as colaboraor then flag  base, show his answrr in history instead of question asnwre
      //collabora will see his answe while admin or peojdt crarir can see answer by collabora
      console.log(mapPayload,"isCollaborator");
      const filterMapUserAnswer: UserAnswersI[] = mapPayload
        .filter(({ isCollaborator }) => isCollaborator)
        .map(({ _id, answer, answerScore }) => ({
          questionId: _id,
          answerBy: req.user._id,
          answer,
          answerScore,
        })) as unknown as UserAnswersI[];

      if (filterMapUserAnswer?.length > 0) {
        console.log({ filterMapUserAnswer },"llloop");
        await this.UserAnswer.CreateUpdateMultiUsersAnswers(filterMapUserAnswer);
        responseHandler(res, { data: mapPayload, message: 'answer-updated', statusCode: HttpStatus.CREATED });
        return;
      }

      const upQuestionAnswerData: QuestionsAnswersI[] = await this.questionAnswer.updateQuestionAnswer(projectId, mapPayload);
      responseHandler(res, { data: upQuestionAnswerData, message: 'question-updated', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  // public updateQuestionAnswerStatus = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const questionAnswerData: QuestionAnswerPatchUpdateI = req.body;
  //     const updateQuestionAnswerData: QuestionsAnswersI = await this.questionAnswer.updateQuestionAnswerStatus(questionAnswerData);

  //     responseHandler(res, { data: updateQuestionAnswerData, message: 'Status Updated', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     //not require as such
  //     if (error.name === 'CastError' && error.path === '_id') {
  //       next(new HttpException(HttpStatus.BAD_REQUEST, "QuestionAnswer doesn't exist"));
  //       return;
  //     }
  //     next(error);
  //   }
  // };

  public assignCollaborators = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorsPayload: AssignQuestionCollaboratorI[] = req.body;
      console.log({ collaboratorsPayload });
      const data: QuestionsAnswersI = await this.questionAnswer.assignCollaborators(collaboratorsPayload);
      responseHandler(res, { data, message: 'question-collabortor-assigned', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public assignSheetCollaborators = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorsPayload: AssignSheetCollaboratorI = req.body;
      console.log({ collaboratorsPayload });
      const data: QuestionsAnswersI = await this.questionAnswer.assignSheetCollaborators(collaboratorsPayload);
      responseHandler(res, { data, message: 'sheet-collabortor-assigned', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
