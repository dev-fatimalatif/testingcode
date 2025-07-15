import { model, Schema, Document } from 'mongoose';
import { ProjectI, ProjectStatusEnum, ProjectStatusValues } from '@/interfaces/projects.interface';
const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: { type: String, required: true },
    regions: [{ type: Schema.Types.ObjectId, ref: 'Region', required: true }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }],
    // subProducts: [{ type: Schema.Types.ObjectId, ref: 'Sub-Product', required: true }],
    promptFile: {
      type: String,
    },
    prompt: {
      type: String,
    },
    dueDate: { type: Date },
    enableCollaborator: {
      type: Boolean,
      default: false,
    },
    rfpFile: {
      type: String,
    },
    status: {
      type: Number,
      enum: ProjectStatusValues, // This should return [0, 1]
      default: ProjectStatusEnum.Active,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { versionKey: false, timestamps: true },
);

export type ProjectSchemaTypo = ProjectI & Document;

export const ProjectModel = model<ProjectSchemaTypo>('Project', ProjectSchema);
