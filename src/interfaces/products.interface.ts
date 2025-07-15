import mongoose from 'mongoose';

export type SubProductRecordI = { name: string; _id: string };

export interface ProductsI {
  name: string;
  subProducts?: Array<SubProductRecordI>;
}

export interface ProductsReponseI {
  _id: mongoose.Types.ObjectId;
  name: string;
  subProducts?: Array<SubProductRecordI>;
}

export type AddSubProductI = Array<{ name: string }>;

export type AddSubProductResponseI = Array<Pick<SubProductRecordI, '_id'>>;
