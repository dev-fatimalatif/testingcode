import { Router } from 'express';
import { RegionController } from '@/controllers/regions.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware, checkPermissions } from '@/middlewares/auth.middleware';
import { RolePermissionsEnum } from '@/interfaces/permissions.interface';

export class RegionRoute implements Routes {
  public path = '/regions';
  public router = Router();
  public region = new RegionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.region.getRegions);
    this.router.get(`${this.path}/:id`, this.region.getRegionById);

    this.router.post(`${this.path}`, this.region.createRegion);
    this.router.post(`${this.path}/bulk-check`, this.region.bulkCheckAndCreateRegions);
    this.router.put(`${this.path}/:id`, this.region.updateRegion);
    this.router.delete(`${this.path}/:id`, this.region.deleteRegion);
  }
}
