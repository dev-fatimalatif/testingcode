import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { AnyBulkWriteOperation, BulkResult, BulkWriteResult, DeleteResult } from 'mongodb'; // Import from the MongoDB package

import { QuestionAnswerModel, QuestionAnswerTypo } from '@models/question-answers.model';
import HttpStatus from '@/constants/HttpStatus';
import {
  AssignQuestionCollaboratorI,
  AssignSheetCollaboratorI,
  AsssignSheetCollaboratorI,
  QuestionAnswerPayloadI,
  QuestionsAnswersI,
} from '@/interfaces/questions-answers.interface';
import { UserTokenData } from '@/interfaces/users.interface';
import { RoleEnum } from '@/interfaces/permissions.interface';
import mongoose, { Document, FilterQuery } from 'mongoose';

@Service()
export class QuestionAnswerService {
  async findQuestionAnswer(text: string): Promise<QuestionsAnswersI[]> {
    // Validate input
    if (!text) {
      throw new Error('Search text is required');
    }

    // Perform a search in MongoDB using regex
    const results = await QuestionAnswerModel.find({
      $or: [
        { question: { $regex: text, $options: 'i' } }, // Case-insensitive search in `question`
        { answer: { $regex: text, $options: 'i' } },   // Case-insensitive search in `answer`
      ],
    });

    return results;
  }

  // Implementing updateAnswer
  public async updateAnswer(
    questionAnswerDataId: string, // The ID of the question-answer data
    AnswerData: QuestionsAnswersI // The new answer data
  ): Promise<QuestionsAnswersI> {
    
    // Find and update the document by its ID
    const updatedQuestionAnswer = await QuestionAnswerModel.findOneAndUpdate(
      { _id: questionAnswerDataId }, // Match by the provided ID
      { 
        $set: { 
          answer: AnswerData.answer, // Update the 'answer' field with new answer
          updatedAt: new Date(), // Optionally, update the timestamp
        }
      },
      { new: true } // Return the updated document
    );

    // If no document was found or updated, throw an error
    if (!updatedQuestionAnswer) {
      throw new HttpException(HttpStatus.NOT_FOUND, "Question Answer not found or could not be updated");
    }

    // Return the updated question-answer document
    return updatedQuestionAnswer;
  }

  
  
  
  
  
  public async findQuestionAnswerByProjectId(projectId: string, loginedUser: UserTokenData, text: string): Promise<QuestionsAnswersI[]> {
    const { _id: currentUserId, role } = loginedUser;
    console.log({ currentUserId, role }, 'currentUserId, role');
    const currentUserRole = role?.name;
    console.log(currentUserRole, 'currentUserRole');

    const findQuery: FilterQuery<QuestionAnswerTypo> = {};
    
    
    
    if ([RoleEnum.PROJECT_CREATOR, RoleEnum.PROJECT_COLLABORATOR].includes(currentUserRole)) {
      findQuery['$or']=[
        {
          'project.collaborators': { $in: [currentUserId] },
        },
        { collaborators: { $in: [currentUserId] } },
       
      ]
      if (currentUserRole === RoleEnum.PROJECT_CREATOR) {
        findQuery['$or'].push({
          'project.createdBy': new mongoose.Types.ObjectId(currentUserId),
        });
      }
    }

    //show answer from answe hitory if user is collabora in that quetion or in project
    const findQuestionAnswer: QuestionsAnswersI[] = await QuestionAnswerModel.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $match: findQuery,
      },
      {
        $addFields: {
          isCollaborator: {
            $or: [
              {
                $in: [new mongoose.Types.ObjectId(currentUserId), '$project.collaborators'], // Check if user is in project collaborators
              },
              {
                $in: [new mongoose.Types.ObjectId(currentUserId), { $ifNull: ['$collaborators', []] }], // Check if user is in question collaborators
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'user-answers', // Assuming user answers are stored in a separate collection
          let: {
            qId: '$_id',
            //  userId: currentUserId,
            isCollaborator: '$isCollaborator',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    //  { $eq: ['$$isCollaborator', false] }, // Perform lookup only if isCollaborator is true
                    { $eq: ['$questionId', '$$qId'] }, // Match question ID
                    //  { $eq: ['$answerBy', '$$userId'] }, // Match user ID
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'users', // Lookup the user details from the `users` collection
                localField: 'answerBy', // The field in `user-answers` referencing the user ID
                foreignField: '_id', // The `_id` field in the `users` collection
                as: 'userDetails',
              },
            },
            {
              $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                userName: '$userDetails.name',
              },
            },
            {
              $project: {
                userDetails: 0,
              },
            },
          ],
          as: 'userAnswers', // Add user's answer
        },
      },
      {
        $addFields: {
          answer: {
            $cond: {
              if: { $eq: ['$isCollaborator', true] }, // Check if the user is a collaborator
              then: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: '$userAnswers', // Iterate over the userAnswers array
                            as: 'userAnswer',
                            cond: {
                              $eq: ['$$userAnswer.answerBy', new mongoose.Types.ObjectId(currentUserId)], // Match the current user ID
                            },
                          },
                        },
                      },
                      0, // Ensure at least one matching answer exists
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$userAnswers', // Iterate over the userAnswers array
                              as: 'userAnswer',
                              cond: {
                                $eq: ['$$userAnswer.answerBy', new mongoose.Types.ObjectId(currentUserId)], // Match the current user ID
                              },
                            },
                          },
                          as: 'userAnswer',
                          in: '$$userAnswer.answer', // Extract only the `answer` field
                        },
                      },
                      0, // Extract the first valid answer
                    ],
                  },
                  else: '', // If no match is found, set to an empty string
                },
              },
              else: '$answer', // If not a collaborator, use the default `answer` field
            },
          },
          answerScore: {
            $cond: {
              if: { $eq: ['$isCollaborator', true] }, // Check if the user is a collaborator
              then: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: '$userAnswers', // Iterate over the userAnswers array
                            as: 'userAnswer',
                            cond: {
                              $eq: ['$$userAnswer.answerBy', new mongoose.Types.ObjectId(currentUserId)], // Match the current user ID
                            },
                          },
                        },
                      },
                      0, // Ensure at least one matching answer exists
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$userAnswers', // Iterate over the userAnswers array
                              as: 'userAnswer',
                              cond: {
                                $eq: ['$$userAnswer.answerBy', new mongoose.Types.ObjectId(currentUserId)], // Match the current user ID
                              },
                            },
                          },
                          as: 'userAnswer',
                          in: '$$userAnswer.answerScore', // Extract only the `answer` field
                        },
                      },
                      0, // Extract the first valid answer
                    ],
                  },
                  else: '', // If no match is found, set to an empty string
                },
              },
              else: '$answerScore', // If not a collaborator, use the default `answer` field
            },
          },
        },
      },
      {
        $addFields: {
          //need to remove later on for collaborator
          userAnswers: {
            $cond: {
              if: { $eq: ['$isCollaborator', false] }, // Include `userAnswers` if `isCollaborator` is true
              then: '$userAnswers',
              else: '$$REMOVE', // Dynamically remove `userAnswers`
            },
          },
          collaborators: {
            $cond: {
              if: { $eq: ['$isCollaborator', false] }, // Include `userAnswers` if `isCollaborator` is true
              then: '$collaborators',
              else: '$$REMOVE', // Dynamically remove `userAnswers`
            },
          },
        },
      },
      {
        $project: {
          project: 0, // Always remove the project field
        },
      },
    ]);


    if (text?.trim()) {
      return findQuestionAnswer.filter(doc => {
        const cleanedQuestion = doc.question ? doc.question.replace(/`/g, "") : "";
        const cleanedAnswer = doc.answer ? doc.answer.replace(/`/g, "") : "";
  
        return (
          cleanedQuestion.toLowerCase().includes(text.toLowerCase()) ||
          cleanedAnswer.toLowerCase().includes(text.toLowerCase())
        );
      });
    }
    // if (!findQuestionAnswer) throw new HttpException(HttpStatus.NOT_FOUND, "Question Answer doesn't exist");

    return findQuestionAnswer;
  }

  public async createQuestionAnswer(questionAnswerData: QuestionsAnswersI[]): Promise<QuestionsAnswersI[]> {
    const createQuestionAnswerData: QuestionsAnswersI[] = await QuestionAnswerModel.insertMany(questionAnswerData);

    return createQuestionAnswerData;
  }

  public async updateQuestionAnswer(projectId: string, questionAnswerData: QuestionsAnswersI[]): Promise<BulkResult> {
    const operations = questionAnswerData.map(item => ({
      updateOne: {
        filter: { project: projectId, _id: item._id }, // Match by project and ID
        update: {
          $set: {
            //  collaborators: item?.collaborators,
            // question: item.question,
            answer: item.answer,
            customPrompt: item.customPrompt,
            markReviewed: item.markReviewed,
            markCompleted: item.markCompleted,
            answerScore: item.answerScore,
            scoreContext: item.scoreContext,
            updatedAt: new Date(), // Update the timestamp
          },
        },
      },
    }));
    const updateQuestionAnswers = (await QuestionAnswerModel.bulkWrite(operations)).toJSON();
    if (!updateQuestionAnswers) throw new HttpException(HttpStatus.NOT_FOUND, "Questions Answers doesn't exist");
    return updateQuestionAnswers;
  }

  public async deleteProjectAllQuestionsAnswers(projectId: string): Promise<DeleteResult> {
    const deleteProjectData = await QuestionAnswerModel.deleteMany({
      project: projectId,
    });
    return deleteProjectData;
  }

  public async assignCollaborators(questionAnswerData: AssignQuestionCollaboratorI[]): Promise<QuestionsAnswersI> {
    const operations = questionAnswerData.map(item => ({
      updateOne: {
        filter: { _id: item._id }, // Match by project and ID
        update: {
          //$addToSet: { collaborators: { $each: item?.collaborators } },
          $set: {
            collaborators: item?.collaborators,
            updatedAt: new Date(), // Update the timestamp
          },
        },
      },
    }));
    const updateQuestionAnswers = (await QuestionAnswerModel.bulkWrite(operations)).toJSON();
    if (!updateQuestionAnswers) throw new HttpException(HttpStatus.NOT_FOUND, "Questions Answers doesn't exist");
    return updateQuestionAnswers;
  }

  public async assignSheetCollaborators(payload: AssignSheetCollaboratorI): Promise<QuestionsAnswersI> {
    const { projectId, sheetName, collaborators } = payload;
    const findSheetQuestions = await QuestionAnswerModel.find({ project: projectId, sheetName }).lean();
    const operations = findSheetQuestions.slice(0, 3).map(item => {
      let prevValue = Array.isArray(item?.collaborators) ? item?.collaborators.map(vl => vl.toString()) : [];

      const newCollaborators = collaborators.filter(({ action }) => action === 'add').map(({ _id }) => _id);
      const removedCollaborators = collaborators.filter(({ action }) => action === 'remove').map(({ _id }) => _id);

      prevValue = [...prevValue].filter(collaborator => !removedCollaborators.includes(collaborator));

      const updatedCollabprators = [...newCollaborators, ...removedCollaborators].map(record => new mongoose.Types.ObjectId(record));
      console.log({ updatedCollabprators });
      return {
        updateOne: {
          filter: { _id: item._id }, // Match by project and ID
          update: {
            // $pull: {
            //   collaborators: { $in: removeCollaborars },
            // },
            // $addToSet: {
            //   collaborators: { $each: newCollaborators },
            // },
            $set: {
              collaborators: updatedCollabprators,
              updatedAt: new Date(), // Update the timestamp
            },
          },
        },
      };
    });
    const updateQuestionAnswers = (await QuestionAnswerModel.bulkWrite(operations)).toJSON();
    if (!updateQuestionAnswers) throw new HttpException(HttpStatus.NOT_FOUND, "Questions Answers doesn't exist");
    return updateQuestionAnswers;
  }
}
