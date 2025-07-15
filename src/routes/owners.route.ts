import { Router } from 'express';
import { OwnerController } from '@/controllers/owners.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class OwnerRoute implements Routes {
  public path = '/owners';
  public router = Router();
  public owner = new OwnerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.owner.getOwners);
    this.router.get(`${this.path}/:id`, this.owner.getOwnerById);

    this.router.post(`${this.path}`, this.owner.createOwner);
    this.router.put(`${this.path}/:id`, this.owner.updateOwner);
    this.router.delete(`${this.path}/:id`, this.owner.deleteOwner);
  }
}
