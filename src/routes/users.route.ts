import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware, checkPermissions } from '@/middlewares/auth.middleware';
import { AuthController } from '@/controllers/auth.controller';
import { RolePermissionsEnum } from '@/interfaces/permissions.interface';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.user.getUsers); // modified.
    this.router.get(`${this.path}/collaborators`, this.user.getCollaboratorOptions);
    this.router.put(`${this.path}/statusUpdate`, this.user.updateUserStatus);// user status api integreted.
    this.router.get(`${this.path}/:id`, this.user.getUserById);

    this.router.post(`${this.path}`, this.auth.awsSignUp);
    this.router.put(`${this.path}/:id`, ValidationMiddleware(CreateUserDto, true), this.user.updateUser);


    this.router.delete(`${this.path}/:id`, this.user.deleteUser);
  }

}
