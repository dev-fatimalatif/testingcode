import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { RoleEnum, RolePermissionsI } from '@interfaces/permissions.interface';
import { RolePermissionModel } from '@models/permissions.model';

@Service()
export class RolePermissionService {
  public async findAllRoleNames(): Promise<RolePermissionsI[]> {
    const RolePermissions: RolePermissionsI[] = await RolePermissionModel.find({ name: { $ne: RoleEnum.SUPER_ADMIN } })
      .select('-permissions')
      .lean();
    return RolePermissions;
  }

  // public async findRolePermissionById(RolePermissionId: string): Promise<RolePermissionsI> {
  //   const findRolePermission: RolePermissionsI = await RolePermissionModel.findOne({ _id: RolePermissionId });
  //   if (!findRolePermission) throw new HttpException(409, "Role Permission doesn't exist");

  //   return findRolePermission;
  // }

  // public async createRolePermission(RolePermissionData: RolePermissionsI): Promise<RolePermissionsI> {
  //   const createRolePermissionData: RolePermissionsI = await RolePermissionModel.create(RolePermissionData);
  //   return createRolePermissionData;
  // }

  // public async updateRolePermission(rolePermissionId: string, RolePermissionData: RolePermissionsI): Promise<RolePermissionsI> {
  //   const updateRolePermissionById: RolePermissionsI = await RolePermissionModel.findByIdAndUpdate(rolePermissionId, { RolePermissionData });
  //   if (!updateRolePermissionById) throw new HttpException(409, "Role Permission doesn't exist");

  //   return updateRolePermissionById;
  // }

  // public async deleteRolePermission(rolePermissionId: string): Promise<RolePermissionsI> {
  //   const deleteRolePermissionById: RolePermissionsI = await RolePermissionModel.findByIdAndDelete(rolePermissionId);
  //   if (!deleteRolePermissionById) throw new HttpException(409, "Role Permission doesn't exist");

  //   return deleteRolePermissionById;
  // }
}
