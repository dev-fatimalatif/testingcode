export interface RolePermissionsI {
  name: RoleEnum;
  permissions?: Array<RolePermissionsEnum>;
}

export enum RoleEnum {
  SUPER_ADMIN = 1,
  ADMIN,
  PROJECT_CREATOR,
  PROJECT_COLLABORATOR,
}

export enum RolePermissionsEnum {
  MANANEG_USERS = 1,
  CREATE_PROJECT,
  DELETE_PROJECT,
  COLLABORATE_PROJECT,
}
