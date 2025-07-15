import mongoose from 'mongoose';

export type ProjectSubProductPayloadI = Array<{ id: mongoose.Types.ObjectId; name: string; new?: boolean }>;

export type ProjectProductsRegionsPayloadI = Array<mongoose.Types.ObjectId | string>;

export interface ProjectI {
  _id: string;
  name: string;
  clientName: string;
  description: string;
  owner: string;
  regions: ProjectProductsRegionsPayloadI;
  products: ProjectProductsRegionsPayloadI;
  // subProducts: Array<mongoose.Types.ObjectId>;
  prompt: string;
  dueDate?: Date; // Optional since it's not required
  createdBy: mongoose.Types.ObjectId;
  collaborators: Array<mongoose.Types.ObjectId>;
  status: ProjectStatusEnum;
  rfpFile: string;
  promptFile: string;
}

export interface ProjectListRecordI extends ProjectI {
  reviewedCount: number;
  completedCount: number;
  totalQuestions: number;
}

export interface ProjectFindQueryI {
  currentPage: number;
  limit: number;
  sortby: number;
  sortColumn: string;
  projectName?: string;
  owner?: string;
  products?: string;
  status?: number;
}

export interface ProjectListI {
  content: Array<ProjectListRecordI>;
  totalRecords: number;
}

export enum ProjectStatusEnum {
  InActive = 0,
  Active = 1,
}

export type ProjectPatchUpdateI = Pick<ProjectI, '_id' | 'status'>;

export const ProjectStatusValues = [ProjectStatusEnum.Active, ProjectStatusEnum.InActive];
