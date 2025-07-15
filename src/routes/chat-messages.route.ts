import { Router } from 'express';
import { ChatMessageController } from '@/controllers/chat-messages.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class ChatMessageRoute implements Routes {
  public path = '/chat-messages';
  public router = Router();
  public chat = new ChatMessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.chat.getChatMessages);
    this.router.get(`${this.path}/:id`, this.chat.getChatMessageById);

    this.router.post(`${this.path}`, this.chat.createChatMessage);
    this.router.put(`${this.path}/:id`, this.chat.updateChatMessage);
    this.router.delete(`${this.path}/:id`, this.chat.deleteChatMessage);
  }
}
