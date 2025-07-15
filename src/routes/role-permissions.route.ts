import { Router } from 'express';
import { RolePermissionController } from '@/controllers/role-permissions.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class RolePermissionRoute implements Routes {
  public path = '/roles';
  public router = Router();
  public owner = new RolePermissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.owner.getRolePermissions);
    // this.router.get(`${this.path}/:id`, this.owner.getRolePermissionById);

    // this.router.post(`${this.path}`, this.owner.createRolePermission);
    // this.router.put(`${this.path}/:id`, this.owner.updateRolePermission);
    // this.router.delete(`${this.path}/:id`, this.owner.deleteRolePermission);
  }
}
