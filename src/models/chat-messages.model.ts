import { model, Schema, Document } from 'mongoose';
import { ChatMessagesI } from '@/interfaces/chat-message.interface';

const ChatMessagesSchema: Schema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'refine-user-text'], // Numeric enum values
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image-url'], // Numeric enum values
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

export type ChatMessagesSchemaTypo = ChatMessagesI & Document;

export const ChatMessagesModel = model<ChatMessagesSchemaTypo>('Chat-Message', ChatMessagesSchema);
