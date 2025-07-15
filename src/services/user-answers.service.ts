import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { BulkResult, DeleteResult } from 'mongodb'; // Import from the MongoDB package

import { UserAnswerModel } from '@models/user-answers.model';
import HttpStatus from '@/constants/HttpStatus';
import { UserAnswersI } from '@/interfaces/user-answers.interface';

@Service()
export class UserAnswerService {
  public async findUserAnswerByProjectId(): Promise<UserAnswersI[]> {
    const findUserAnswer: UserAnswersI[] = await UserAnswerModel.find().lean();
    if (!findUserAnswer) throw new HttpException(HttpStatus.NOT_FOUND, "Question Answer doesn't exist");

    return findUserAnswer;
  }

  public async createMultiUserAnswers(UserAnswerData: UserAnswersI[]): Promise<UserAnswersI[]> {
    const createUserAnswerData: UserAnswersI[] = await UserAnswerModel.insertMany(UserAnswerData);

    return createUserAnswerData;
  }

  // public async createUserAnswer(UserAnswerData: UserAnswersI): Promise<UserAnswersI> {
  //   const createUserAnswerData: UserAnswersI = await UserAnswerModel.create(UserAnswerData);

  //   return createUserAnswerData;
  // }

  public async updateUserAnswer(userAnswerId: string, data: Partial<UserAnswersI>): Promise<UserAnswersI> {
    const userAnswerById: UserAnswersI = await UserAnswerModel.findByIdAndUpdate(userAnswerId, data, { new: true });
    if (!userAnswerById) throw new HttpException(HttpStatus.NOT_FOUND, "User Answer doesn't exist");
    return userAnswerById;
  }

  public async CreateUpdateMultiUsersAnswers(UserAnswerData: UserAnswersI[]): Promise<BulkResult> {
    const operations = UserAnswerData.map(item => ({
      updateOne: {
        filter: { questionId: item.questionId, answerBy: item.answerBy }, // Match by project and ID
        update: {
          $set: {
            ...item,
            updatedAt: new Date(), // Update the timestamp
          },
        },
        upsert: true,
      },
    }));
    const updateUserAnswers = (await UserAnswerModel.bulkWrite(operations)).toJSON();
    if (!updateUserAnswers) throw new HttpException(HttpStatus.NOT_FOUND, "User Answers doesn't exist");
    return updateUserAnswers;
  }

  // public async deleteProjectAllQuestionsAnswers(projectId: string): Promise<DeleteResult> {
  //   const deleteProjectData = await UserAnswerModel.deleteMany({
  //     project: projectId,
  //   });
  //   return deleteProjectData;
  // }
}
