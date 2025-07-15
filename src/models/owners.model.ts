import { model, Schema, Document } from 'mongoose';
import { OwnersI } from '@/interfaces/owners.interface';

const OwnerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    designationName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true },
);

export type OwnerSchemaTypo = OwnersI & Document;

export const OwnerModel = model<OwnerSchemaTypo>('Owner', OwnerSchema);
