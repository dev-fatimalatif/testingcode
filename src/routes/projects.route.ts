import express, { Router } from 'express';
import { ProjectController } from '@/controllers/projects.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware, checkPermissions } from '@/middlewares/auth.middleware';
import { upload } from '@/services/image.service';
import path from 'path';
import { RolePermissionsEnum } from '@/interfaces/permissions.interface';
export class ProjectRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public project = new ProjectController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.project.getProjects);
    this.router.get(`${this.path}/:id`, this.project.getProjectById);

    this.router.post(`${this.path}`, checkPermissions(RolePermissionsEnum.CREATE_PROJECT), this.project.createProject);

    //depcrecated
    this.router.post(`${this.path}/upload-rfp`, upload.single('file'), this.project.uploadProjectRfp);

    this.router.put(`${this.path}/:id`, upload.single('prompt-file'), this.project.updateProject);
    this.router.put(`${this.path}/status/updateStatus`, this.project.updateProjectStatus);
    this.router.delete(`${this.path}/:id`, this.project.deleteProject);
    this.router.get(`${this.path}/s3/generate-presignedurl-get`, this.project.generatePreSignedForRetrieve);
    this.router.get(`${this.path}/s3/generate-presignedurl-upload`, this.project.generatePreSignedForUpload);
    this.router.use(`${this.path}/files`, express.static(path.join(path.resolve(__dirname, '../assets'))));
  }
}
