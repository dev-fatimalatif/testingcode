import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User, UserPayloadI, UserStatusEnum } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import HttpStatus from '@/constants/HttpStatus';
import { RoleEnum } from '@/interfaces/permissions.interface';
import mongoose from 'mongoose';

@Service()
export class UserService {

  public async findAllUser({
    userName,
    roles,
    orderColumn,
    orderBy,
    currentPage,
    pageSize,
  }: any): Promise<{ users: User[], totalRecords: number }> {
    const query: Record<string, any> = {};
  
    if (userName) {
      query.name = { $regex: new RegExp(userName, 'i') };
    }
  
    if (roles) {
      query.role = new mongoose.Types.ObjectId(roles);
      console.log("Searching for role:", query.role);
    }
  
    const sortBy = orderBy === 'ascend' ? 1 : -1;
  
    // Get total count of users matching the query
    const totalRecords = await UserModel.countDocuments(query);
  
    const users: User[] = await UserModel.aggregate([
      {
        $match: query  // Apply the role filter BEFORE lookup
      },
      {
        $lookup: {
          from: 'role-permissions',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          [orderColumn]: sortBy,
        },
      },
      {
        $skip: (currentPage - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
      {
        $project: {
          cognitoUserId: 0,
        },
      },
    ]);
  
    return { users, totalRecords };
  }
  
  

  // public async findAllUser(): Promise<User[]> {
  //   const users: User[] = await UserModel.aggregate([
  //     {
  //       $lookup: {
  //         from: 'role-permissions',
  //         localField: 'role',
  //         foreignField: '_id',
  //         as: 'role',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         // Unwind the 'roleDetails' array to make it an object
  //         path: '$role',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $match: {
  //         'role.name': { $ne: RoleEnum.SUPER_ADMIN },
  //       },
  //     },
  //     {
  //       $project: {
  //         cognitoUserId: 0,
  //         // roleDetails: 0,
  //       },
  //     },
  //   ]);

  //   return users;
  // }



  public async findCollaboratorOptions(): Promise<User[]> {
    const users: User[] = await UserModel.aggregate([
      {
        $lookup: {
          from: 'role-permissions',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: {
          // Unwind the 'roleDetails' array to make it an object
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            { 'role.name': { $ne: RoleEnum.SUPER_ADMIN } }, // exclude super admin
            { status: 1 }, // include only active users
          ],
        },
      },
      {
        $project: {
          cognitoUserId: 0,
          // roleDetails: 0,
        },
      },
    ]);

    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await UserModel.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: UserPayloadI): Promise<User> {
    const findUser: User = await UserModel.findOne({ email: userData.email });
    if (findUser) throw new HttpException(HttpStatus.CONFLICT, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserModel.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: string, userData: UserPayloadI): Promise<User> {
    if (userData.email) {
      const findUser: User = await UserModel.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) throw new HttpException(HttpStatus.CONFLICT, `This email ${userData.email} already exists`);
    }

    const updateUserById: User = await UserModel.findByIdAndUpdate(userId, userData);
    if (!updateUserById) throw new HttpException(HttpStatus.NOT_FOUND, "User doesn't exist");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: User = await UserModel.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(409, "User doesn't exist");

    return deleteUserById;
  }

  public async updateUserStatus(userId: string, status: UserStatusEnum): Promise<User> {
    console.log("Updating user:", userId, "with status:", status);
    
    const updateUserById: User = await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { status: status },
      { new: true }
    );
    
    console.log("Updated user:", updateUserById);
    
    if (!updateUserById) throw new HttpException(HttpStatus.NOT_FOUND, "User doesn't exist");

    return updateUserById;
  }
}
