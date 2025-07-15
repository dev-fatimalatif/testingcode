import { model, Schema, Document } from 'mongoose';
import { ProductsI, SubProductRecordI } from '@/interfaces/products.interface';

const SubProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: false },
);

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // subProducts: {
    //   type: [SubProductSchema],
    //   default: [],
    // },
  },
  { versionKey: false, timestamps: true },
);

export type ProductSchemaTypo = ProductsI & Document;
export type SubProductSchemaTypo = SubProductRecordI & Document;

model<SubProductSchemaTypo>('Sub-Product', SubProductSchema);

export const ProductModel = model<ProductSchemaTypo>('Product', ProductSchema);
