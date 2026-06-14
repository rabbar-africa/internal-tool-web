import type { IOrganization } from "./common";

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  userRoles: Array<{
    userId: string;
    roleId: string;
    assignedAt: string;
    role: {
      id: string;
      name: string;
      description: string;
      isSystem: boolean;
      organizationId: string;
      createdAt: string;
      updatedAt: string;
      rolePermissions: Array<string>;
    };
  }>;
  permissions: Array<string>;
  organization: IOrganization;
}
