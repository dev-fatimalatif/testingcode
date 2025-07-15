import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { OwnerService } from '@/services/owners.service';
import { OwnersI } from '@/interfaces/owners.interface';

export class OwnerController {
  public Owner = Container.get(OwnerService);

  public getOwners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllOwnersData: OwnersI[] = await this.Owner.findAllOwner();

      responseHandler(res, { data: findAllOwnersData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getOwnerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OwnerId: string = req.params.id;
      const findOneOwnerData: OwnersI = await this.Owner.findOwnerById(OwnerId);

      responseHandler(res, { data: findOneOwnerData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OwnerData: OwnersI = req.body;
      const createOwnerData: OwnersI = await this.Owner.createOwner(OwnerData);

      responseHandler(res, { data: createOwnerData, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OwnerId: string = req.params.id;
      const OwnerData: OwnersI = req.body;
      const updateOwnerData: OwnersI = await this.Owner.updateOwner(OwnerId, OwnerData);

      responseHandler(res, { data: updateOwnerData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OwnerId: string = req.params.id;
      const deleteOwnerData: OwnersI = await this.Owner.deleteOwner(OwnerId);

      responseHandler(res, { data: deleteOwnerData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
