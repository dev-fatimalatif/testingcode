import { model, Schema, Document } from 'mongoose';
import { RegionsI } from '@/interfaces/regions.interface';

const RegionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true },
);

export type RegionSchemaTypo = RegionsI & Document;

export const RegionModel = model<RegionSchemaTypo>('Region', RegionSchema);
