import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { ChatMessagesI } from '@interfaces/chat-message.interface';
import { ChatMessagesModel } from '@/models/chat-messages.model';

@Service()
export class ChatMessageService {
  public async findAllChatMessage(): Promise<ChatMessagesI[]> {
    const ChatMessages: ChatMessagesI[] = await ChatMessagesModel.find();
    return ChatMessages;
  }

  public async findChatMessageById(ChatMessagesId: string): Promise<ChatMessagesI> {
    const findChatMessage: ChatMessagesI = await ChatMessagesModel.findOne({ _id: ChatMessagesId });
    if (!findChatMessage) throw new HttpException(409, "ChatMessage doesn't exist");

    return findChatMessage;
  }

  public async createChatMessage(ChatMessageData: ChatMessagesI[]): Promise<ChatMessagesI[]> {
    const createChatMessageData: ChatMessagesI[] = await ChatMessagesModel.insertMany(ChatMessageData);
    return createChatMessageData;
  }

  public async updateChatMessage(ChatMessagesId: string, ChatMessageData: ChatMessagesI): Promise<ChatMessagesI> {
    const updateChatMessageById: ChatMessagesI = await ChatMessagesModel.findByIdAndUpdate(ChatMessagesId, { ChatMessageData });
    if (!updateChatMessageById) throw new HttpException(409, "ChatMessage doesn't exist");

    return updateChatMessageById;
  }

  public async deleteChatMessage(ChatMessagesId: string): Promise<ChatMessagesI> {
    const deleteChatMessageById: ChatMessagesI = await ChatMessagesModel.findByIdAndDelete(ChatMessagesId);
    if (!deleteChatMessageById) throw new HttpException(409, "ChatMessage doesn't exist");

    return deleteChatMessageById;
  }
}
