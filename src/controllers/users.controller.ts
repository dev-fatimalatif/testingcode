import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { User, UserPayloadI, UserResponse } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';

export class UserController {
  public user = Container.get(UserService);

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPage = 1, pageSize = 10, userName, roles, orderColumn = 'name', orderBy = 'ascend' } = req.query;
  
      // Get the data and total count from findAllUser
      const { users, totalRecords } = await this.user.findAllUser({
        userName,
        roles,
        orderColumn,
        orderBy,
        currentPage: parseInt(currentPage as string),
        pageSize: parseInt(pageSize as string),
      });
      // Structure the response to match the desired format
    const response = {
      // message: 'findAll',
      
        content: users,
        totalRecords: totalRecords,
      
      // success: true,
    };
  
      // Return the data along with totalRecords
      responseHandler(res, { data: response, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
  
  

  // public getUsers = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const findAllUsersData: UserResponse[] = await this.user.findAllUser();

  //     responseHandler(res, { data: findAllUsersData, message: 'findAll', statusCode: HttpStatus.OK });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public getCollaboratorOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: UserResponse[] = await this.user.findCollaboratorOptions();
      responseHandler(res, { data: findAllUsersData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.user.findUserById(userId);

      responseHandler(res, { data: findOneUserData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UserPayloadI = req.body;
      const createUserData: User = await this.user.createUser(userData);

      responseHandler(res, { data: createUserData, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: UserPayloadI = req.body;
      const updateUserData: User = await this.user.updateUser(userId, userData);

      responseHandler(res, { data: updateUserData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body,"kkkkkkkkkoooooo");
    try {
      const userId: string = req.body._id;
      const status = req.body.status;
      console.log(userId, status,"kkkkkkkkk");
      const updateUserData: User = await this.user.updateUserStatus(userId, status);
      console.log(updateUserData,"kkkkkkkkk");
      responseHandler(res, { data: updateUserData, message: 'User status updated successfully', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.user.deleteUser(userId);

      responseHandler(res, { data: deleteUserData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
}
