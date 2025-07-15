import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { ChatMessagesI, PostMessagePayload, MessageType, SenderRoleType, MessageTextType } from '@/interfaces/chat-message.interface';
import { ChatMessageService } from '@/services/chat-messages.service';
import { tryCatchHandler } from '@/middlewares/error.middleware';
import axios from 'axios';
import { PROMPT_API_BASE_PATH } from '@/config';
import mongoose from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';

export class ChatMessageController {
  public ChatMessage = Container.get(ChatMessageService);

  public getChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllChatMessagesData: ChatMessagesI[] = await this.ChatMessage.findAllChatMessage();

      responseHandler(res, { data: findAllChatMessagesData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getChatMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ChatMessagesId: string = req.params.id;
      const findOneChatMessageData: ChatMessagesI = await this.ChatMessage.findChatMessageById(ChatMessagesId);

      responseHandler(res, { data: findOneChatMessageData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createChatMessage = tryCatchHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ChatMessagePayload: PostMessagePayload[] = req.body;
      const query: string = req.query?.query as string;
      const userId: string = req.user?._id;
  
      // Extract token from req.user
      const token = (req?.user as any)?.token; // Get token from incoming request
      if (!token) {
        return next(new HttpException(HttpStatus.UNAUTHORIZED, "Access token missing"));
      }
  
      // Attach Authorization Header
      const messageResponse = await axios.post(
        `${PROMPT_API_BASE_PATH}/chat?query=${query}`,
        ChatMessagePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in header.
            "Content-Type": "application/json",
          },
        }
      );
  
      const responseData = (messageResponse as any)?.data?.response as PostMessagePayload[];
      const [refineQueryMessage, assistantMessage] = [responseData.at(-2), responseData.at(-1)];
  
      const chatMessageData: ChatMessagesI[] = [
        {
          user: new mongoose.Types.ObjectId(userId),
          type: 'text',
          role: 'user',
          message: query,
        },
        {
          user: new mongoose.Types.ObjectId(userId),
          type: refineQueryMessage.content[0].type as MessageTextType,
          role: 'refine-user-text',
          message: refineQueryMessage.content[0].text,
        },
        {
          user: new mongoose.Types.ObjectId(userId),
          type: assistantMessage.content[0].type as MessageTextType,
          role: 'assistant',
          message: assistantMessage.content[0].text,
        },
      ];
  
      console.log({ query });
  
      const createChatMessageData: ChatMessagesI[] = await this.ChatMessage.createChatMessage(chatMessageData);
  
      responseHandler(res, { data: createChatMessageData, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  });
  

  public updateChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ChatMessagesId: string = req.params.id;
      const ChatMessageData: ChatMessagesI = req.body;
      const updateChatMessageData: ChatMessagesI = await this.ChatMessage.updateChatMessage(ChatMessagesId, ChatMessageData);

      responseHandler(res, { data: updateChatMessageData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ChatMessagesId: string = req.params.id;
      const deleteChatMessageData: ChatMessagesI = await this.ChatMessage.deleteChatMessage(ChatMessagesId);

      responseHandler(res, { data: deleteChatMessageData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
