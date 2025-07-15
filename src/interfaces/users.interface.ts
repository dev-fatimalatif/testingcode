import mongoose from 'mongoose';
import { UserType } from './auth.interface';
import { RolePermissionsI } from './permissions.interface';

export enum UserStatusEnum {
  InActive = 0,
  Active = 1,
}

export const UserStatusValues = [UserStatusEnum.Active, UserStatusEnum.InActive];

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role: mongoose.Types.ObjectId | RolePermissionsI;
  cognitoUserId?: string;
  isTemporaryPassword?: boolean; // new field
  resetToken?: string;
  resetTokenExpiration?: number;  // Add resetTokenExpiration here
  password: string;
  status: UserStatusEnum;
}

export interface UserPayloadI {
  _id?: string;
  name?: string;
  email: string;
  role: mongoose.Types.ObjectId;
  status?: UserStatusEnum;
}

export type UserResponse = Omit<User, 'password'>;
export type UserTokenData = Omit<User, 'password'> & {
  role: RolePermissionsI;
};
