import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { ProjectService } from '@/services/projects.service';
import { ProjectI, ProjectListI, ProjectPatchUpdateI, ProjectProductsRegionsPayloadI } from '@/interfaces/projects.interface';
import { HttpException } from '@/exceptions/HttpException';
import { tryCatchHandler } from '@/middlewares/error.middleware';
import mongoose from 'mongoose';
import { QuestionAnswerService } from '@/services/questions-answers.service';
import { ProductService } from '@/services/products.service';
import { S3ImageService } from '@/services/s3Image.service';
import { ProductsI } from '@/interfaces/products.interface';
import { RegionService } from '@/services/regions.service';
import { RegionsI } from '@/interfaces/regions.interface';
import { RoleEnum } from '@/interfaces/permissions.interface';

export class ProjectController {
  public project = Container.get(ProjectService);
  public product = Container.get(ProductService);
  public region = Container.get(RegionService);

  public s3ImageService = Container.get(S3ImageService);

  public questionAnswer = Container.get(QuestionAnswerService);

  public getProjects = tryCatchHandler(async (req: Request, res: Response) => {
    const currentPage = parseInt(req.query?.currentPage as string) || 1;
    const pageSize = parseInt(req.query?.pageSize as string) || 10;

    const sortBy = req.query?.sortBy ?? 'asc';
    const sortColumn = (req.query?.sortColumn as string) ?? 'name';

    const loginedUser = req.user;

    const findAllProjectsData: ProjectListI = await this.project.findAllProject(
      {
        ...req.query,
        currentPage,
        limit: pageSize,
        sortColumn: sortColumn === 'name' ? 'lowerCaseName' : sortColumn,
        sortby: 'descending'.includes((sortBy as string).toLowerCase()) ? -1 : 1,
      },
      loginedUser,
    );
    responseHandler(res, { data: findAllProjectsData, message: 'findAll', statusCode: HttpStatus.OK });
  });

  public getProjectById = tryCatchHandler(async (req: Request, res: Response) => {
    const projectId: string = req.params.id;
    const findOneProjectData: ProjectI = await this.project.findProjectById(projectId);

    responseHandler(res, { data: findOneProjectData, message: 'findOne', statusCode: HttpStatus.OK });
  });

  // public addUpdateProjectSubProduct = async (productId: mongoose.Types.ObjectId, subProductsPayload: ProjectSubProductPayloadI) => {
  //   const newSubProducts = subProductsPayload.filter(record => record?.new);

  //   const addedSubProducts =
  //     newSubProducts?.length > 0 ? (await this.product.AddSubProduct(productId, newSubProducts as any)).map(({ _id }) => _id) : [];

  //   const existingSubProducts = subProductsPayload.filter(record => !record?.new).map(({ id }) => id);
  //   return [...addedSubProducts, ...existingSubProducts] as Array<mongoose.Types.ObjectId>;
  // };

  public addProjectMultiProducts = async (projectProductsPayload: ProjectProductsRegionsPayloadI) => {
    const newProducts = projectProductsPayload
      .filter(id => !mongoose.Types.ObjectId.isValid(id))
      .map(name => ({
        name,
      })) as ProductsI[];

    const addedNewProducts = newProducts?.length > 0 ? (await this.product.createMultiProduct(newProducts)).map(({ _id }) => _id) : [];

    const existingProducts = projectProductsPayload.filter(id => mongoose.Types.ObjectId.isValid(id));

    return [...existingProducts, ...addedNewProducts];
  };

  public addProjectMultiRegions = async (regionsPayload: ProjectProductsRegionsPayloadI) => {
    console.log({ regionsPayload }, 'regionsPayload in controller addProjectMultiRegions');
    const newRegions = regionsPayload
      .filter(id => !mongoose.Types.ObjectId.isValid(id))
      .map(name => ({
        name,
      })) as RegionsI[];

    const addedNewRegions = newRegions?.length > 0 ? (await this.region.createMultiRegion(newRegions)).map(({ _id }) => _id) : [];

    const existingRegions = regionsPayload.filter(id => mongoose.Types.ObjectId.isValid(id));

    return [...existingRegions, ...addedNewRegions];
  };

  public createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData: ProjectI = req.body;
      projectData.createdBy = new mongoose.Types.ObjectId(req.user._id);
      projectData.products = await this.addProjectMultiProducts(projectData.products);
      console.log({ products: projectData.products }, 'products in controller');
      projectData.regions = await this.addProjectMultiRegions(projectData.regions);
      console.log({ regions: projectData.regions }, 'regions in controller');
      // const projectSubProducts = (projectData?.subProducts as unknown as ProjectSubProductPayloadI) ?? [];

      // projectData.subProducts = await this.addUpdateProjectSubProduct(projectData.product, projectSubProducts);

      const createProjectData: ProjectI = await this.project.createProject(projectData);

      const projectById = await this.project.findProjectById(createProjectData._id);
      responseHandler(res, { data: projectById, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      console.log({ error });
      if (error.code === 11000) {
        await this.s3ImageService.deleteObject(req.body.rfpFile);
        next(new HttpException(HttpStatus.CONFLICT, 'Project Name Already Exist'));
        return;
      }
      next(error);
    }
  };

  public updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.id;
      const projectData: ProjectI = req.body;
      // const projectSubProducts = (projectData?.subProducts as unknown as ProjectSubProductPayloadI) ?? [];
      // projectData.subProducts = await this.addUpdateProjectSubProduct(projectData.product, projectSubProducts);

      projectData.products = await this.addProjectMultiProducts(projectData.products);
      projectData.regions = await this.addProjectMultiRegions(projectData.regions);

      const updateProjectData: ProjectI = await this.project.updateProject(projectId, projectData);

      responseHandler(res, { data: updateProjectData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      if (error.code === 11000) {
        next(new HttpException(HttpStatus.CONFLICT, 'Project Name Already Exist'));
        return;
      }
      next(error);
    }
  };

  public uploadProjectRfp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.body.projectId;
      const rfpFile = req.file.filename ?? req.body.fileName;
      const updateProjectData: ProjectI = await this.project.updateProject(projectId, {
        rfpFile,
      });

      responseHandler(res, { data: updateProjectData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      if (error.code === 11000) {
        next(new HttpException(HttpStatus.CONFLICT, 'Project Name Already Exist'));
        return;
      }
      next(error);
    }
  };

  public generatePreSignedForUpload = tryCatchHandler(async (req: Request, res: Response) => {
    const { fileName, type } = req.query;
    const payload = {
      fileName,
      type,
      userId: req.user._id,
    };
    const { url, key } = await this.s3ImageService.generatePreSignedUrlForUpload(payload);
    responseHandler(res, { data: { url, key }, message: 'updated', statusCode: HttpStatus.OK });
  });

  public generatePreSignedForRetrieve = tryCatchHandler(async (req: Request, res: Response) => {
    const key = req.query.fileKey as string;
    const url = await this.s3ImageService.generatePreSignedUrlForRetrieve({ key });

    responseHandler(res, { data: url, message: 'updated', statusCode: HttpStatus.OK });
  });

  public updateProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData: ProjectPatchUpdateI = req.body;
      const updateProjectData: ProjectI = await this.project.updateProject(projectData._id, projectData);

      responseHandler(res, { data: updateProjectData, message: 'Status Updated', statusCode: HttpStatus.OK });
    } catch (error) {
      //not require as such
      if (error.name === 'CastError' && error.path === '_id') {
        next(new HttpException(HttpStatus.BAD_REQUEST, "Project doesn't exist"));
        return;
      }
      next(error);
    }
  };

  public deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.id;
      const deleteProject = await this.project.deleteProject(projectId);
      this.s3ImageService.deleteObject(deleteProject.rfpFile);
      await this.questionAnswer.deleteProjectAllQuestionsAnswers(projectId);
      responseHandler(res, { data: { deleteProjectId: projectId }, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
