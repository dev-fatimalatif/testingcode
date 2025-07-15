import { model, Schema, Document } from 'mongoose';
import { User, UserStatusEnum, UserStatusValues } from '@interfaces/users.interface';

const UserSchema: Schema = new Schema(
  {
    cognitoUserId: {
      //UserSub
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: { type: Schema.Types.ObjectId, ref: 'Role-Permission', required: true },
    isTemporaryPassword: { type: Boolean, default: false }, // Added field
    resetToken: { type: String, default: undefined }, // For password reset
    resetTokenExpiration: { type: Number, default: undefined }, // Timestamp for token expiration
    status: {
      type: Number,
      enum: UserStatusValues,
      default: UserStatusEnum.Active,
    },
  },
  { versionKey: false, timestamps: true },
);

// Function to remove sensitive fields like password before sending response
const removeSensitiveFields = (doc, ret) => {
  delete ret._id;
  delete ret.cognitoUserId; // Remove cognitoUserId field from the response
  delete ret.password; // Ensure password is not included in the response
  return ret;
};

UserSchema.set('toObject', {
  virtuals: true,
  transform: removeSensitiveFields,
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: removeSensitiveFields,
});

export type UserSchemaTypo = User & Document;

export const UserModel = model<UserSchemaTypo>('User', UserSchema);
