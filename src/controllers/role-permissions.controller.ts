import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { RolePermissionService } from '@/services/role-permissions.service';
import { RolePermissionsI } from '@/interfaces/permissions.interface';

export class RolePermissionController {
  public RolePermission = Container.get(RolePermissionService);

  public getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllRolePermissionsData: RolePermissionsI[] = await this.RolePermission.findAllRoleNames();

      responseHandler(res, { data: findAllRolePermissionsData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  // public getRolePermissionById = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const RolePermissionId: string = req.params.id;
  //     const findOneRolePermissionData: RolePermissionsI = await this.RolePermission.findRolePermissionById(RolePermissionId);

  //     responseHandler(res, { data: findOneRolePermissionData, message: 'findOne', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public createRolePermission = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const RolePermissionData: RolePermissionsI = req.body;
  //     const createRolePermissionData: RolePermissionsI = await this.RolePermission.createRolePermission(RolePermissionData);

  //     responseHandler(res, { data: createRolePermissionData, message: 'created', statusCode: HttpStatus.CREATED });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public updateRolePermission = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const RolePermissionId: string = req.params.id;
  //     const RolePermissionData: RolePermissionsI = req.body;
  //     const updateRolePermissionData: RolePermissionsI = await this.RolePermission.updateRolePermission(RolePermissionId, RolePermissionData);

  //     responseHandler(res, { data: updateRolePermissionData, message: 'updated', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public deleteRolePermission = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const RolePermissionId: string = req.params.id;
  //     const deleteRolePermissionData: RolePermissionsI = await this.RolePermission.deleteRolePermission(RolePermissionId);

  //     responseHandler(res, { data: deleteRolePermissionData, message: 'deleted', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
