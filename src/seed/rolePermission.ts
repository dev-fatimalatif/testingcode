import { RolePermissionsEnum, RoleEnum, RolePermissionsI } from '@/interfaces/permissions.interface';
import { RolePermissionModel } from '@/models/permissions.model';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';
const { MANANEG_USERS, CREATE_PROJECT, DELETE_PROJECT, COLLABORATE_PROJECT } = RolePermissionsEnum;

const rolePermissionsData: RolePermissionsI[] = [
  {
    name: RoleEnum.SUPER_ADMIN,
    permissions: [MANANEG_USERS, CREATE_PROJECT, DELETE_PROJECT, COLLABORATE_PROJECT],
  },
  {
    name: RoleEnum.ADMIN,
    permissions: [CREATE_PROJECT, DELETE_PROJECT, COLLABORATE_PROJECT],
  },
  {
    name: RoleEnum.PROJECT_CREATOR,
    permissions: [CREATE_PROJECT, COLLABORATE_PROJECT],
  },
  {
    name: RoleEnum.PROJECT_COLLABORATOR,
    permissions: [COLLABORATE_PROJECT],
  },
];
export const seedRolePermission = async () => {
  console.log({ rolePermissionsData });
  const bulkOps = rolePermissionsData.map(role => ({
    updateOne: {
      filter: { name: role.name }, // Match role by name
      update: { $set: { permissions: role.permissions, name: role.name } }, // Update the permissions
      upsert: true, // If role does not exist, insert a new one
    },
  }));

  // Execute the bulk operations
  const result = await RolePermissionModel.bulkWrite(bulkOps);
  logger.info(`Bulk write result: ${result}`);
  logger.info('Roles and Permissions seeded or updated successfully');
};
