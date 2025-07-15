import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { RegionService } from '@/services/regions.service';
import { RegionsI } from '@/interfaces/regions.interface';
import { HttpException } from '@/exceptions/HttpException';

export class RegionController {
  public region = Container.get(RegionService);

  public getRegions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllRegionsData: RegionsI[] = await this.region.findAllRegion();

      responseHandler(res, { data: findAllRegionsData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getRegionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const regionId: string = req.params.id;
      const findOneRegionData: RegionsI = await this.region.findRegionById(regionId);

      responseHandler(res, { data: findOneRegionData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const regionData: RegionsI = req.body;
      const createRegionData: RegionsI = await this.region.createRegion(regionData);

      responseHandler(res, { data: createRegionData, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const regionId: string = req.params.id;
      const regionData: RegionsI = req.body;
      const updateRegionData: RegionsI = await this.region.updateRegion(regionId, regionData);

      responseHandler(res, { data: updateRegionData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const regionId: string = req.params.id;
      const deleteRegionData: RegionsI = await this.region.deleteRegion(regionId);

      responseHandler(res, { data: deleteRegionData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public bulkCheckAndCreateRegions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { regions } = req.body;
      
      if (!Array.isArray(regions)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Regions must be an array');
      }

      const result = await this.region.bulkCheckAndCreateRegions(regions);
      responseHandler(res, { 
        data: result, 
        message: 'Regions processed successfully', 
        statusCode: HttpStatus.OK 
      });
    } catch (error) {
      next(error);
    }
  };
}
