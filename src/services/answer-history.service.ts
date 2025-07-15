import { Service } from 'typedi';
import { AnswerHistoryModel } from '@/models/answer-history.model';
import { HttpException } from '@/exceptions/HttpException';
import { HttpStatus } from '@/constants/HttpStatus';
import { AnswerHistoryTypo } from '@/models/answer-history.model';

@Service()
export class AnswerHistoryService {
  /**
   * Fetch all answer history records.
   */
  public async getAllAnswerHistory(): Promise<AnswerHistoryTypo[]> {
    return await AnswerHistoryModel.find().populate('question_id'); // Populate question details
  }

  /**
   * Fetch answer history by Question ID.
   */
  public async getAnswerHistoryByQuestionId(questionId: string) {
    return await AnswerHistoryModel.find({ question_id: questionId })
      .sort({ createdAt: -1 }) // 🔥 Sort by `createdAt` in descending order (latest first)
      .limit(3) // 🔥 Fetch only the top 3 results
      .populate('question_id'); // Populate related question details
  }

  /**
   * Create a new answer history record.
   */
  public async createAnswerHistory(data: { answer: string; question_id: string; customPrompt?: string }) {
    const newAnswerHistory = new AnswerHistoryModel(data);
    return await newAnswerHistory.save();
  }
}
