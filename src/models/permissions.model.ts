import { model, Schema, Document } from 'mongoose';
import { RoleEnum, RolePermissionsEnum, RolePermissionsI } from '@/interfaces/permissions.interface';

const { MANANEG_USERS, CREATE_PROJECT, DELETE_PROJECT, COLLABORATE_PROJECT } = RolePermissionsEnum;
const RolePermissionsSchema: Schema = new Schema(
  {
    name: {
      //will be enum value 1,2,3,4
      type: Number,
      enum: Object.values(RoleEnum), // Numeric enum values
      required: true,
    },
    permissions: [
      {
        type: Number,
        required: true,
        unique: true,
        enum: [MANANEG_USERS, CREATE_PROJECT, DELETE_PROJECT, COLLABORATE_PROJECT], // Numeric enum values
      },
    ],
  },
  { versionKey: false },
);

export type PermissionSchemaTypo = RolePermissionsI & Document;

export const RolePermissionModel = model<PermissionSchemaTypo>('Role-Permission', RolePermissionsSchema);
