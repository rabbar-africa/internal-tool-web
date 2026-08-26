import type { IPermissionRecord, IRole, IUser } from "./user";

/** A member of the organization — the shape `GET /users` returns. */
export type ITeamMember = Pick<
  IUser,
  | "id"
  | "email"
  | "firstName"
  | "lastName"
  | "phoneNumber"
  | "avatarUrl"
  | "isActive"
  | "isEmailVerified"
  | "lastLoginAt"
  | "organizationId"
  | "createdAt"
  | "updatedAt"
  | "userRoles"
>;

export type UserInviteStatus = "PENDING" | "ACCEPTED" | "CANCELLED";

export interface IUserInvite {
  id: string;
  email: string;
  status: UserInviteStatus;
  organizationId: string;
  invitedById?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** The roles the invitee will hold once they accept. */
  roles?: IRole[];
}

export interface CreateInvitePayload {
  email: string;
  /** At least one role is required by the API. */
  roleIds: string[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

export interface TeamMemberFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface UpdateTeamMemberPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/** One entry of `GET /permissions/grouped` — an array, not a keyed object. */
export interface IPermissionGroup {
  subject: string;
  permissions: IPermissionRecord[];
}
