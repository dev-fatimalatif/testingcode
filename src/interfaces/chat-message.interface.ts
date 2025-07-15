import mongoose from 'mongoose';

export type RoleEnum = ['user', 'assistant', 'refine-user-text'];
export type MessageType = ['text', 'image-url'];
export type SenderRoleType = 'user' | 'assistant' | 'refine-user-text';
export type MessageTextType = 'text' | 'image-url';
export interface ChatMessagesI {
  role: SenderRoleType;
  user: mongoose.Types.ObjectId;
  message: string;
  type: MessageTextType;
}

export interface MessageContent {
  type: string;
  text: string;
}

export interface PostMessagePayload {
  role: string;
  content: MessageContent[];
}
