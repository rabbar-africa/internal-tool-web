import type { IOrganization } from "./common";

/** The four verbs every permission is built from. */
export type PermissionAction = "create" | "read" | "update" | "delete";

/**
 * The resources the API guards, as the backend's PERMISSION_SUBJECTS lists
 * them. `src/shared/constants/access.ts` is typed against this strict union,
 * so a misspelt subject there fails to compile.
 */
export type KnownPermissionSubject =
  | "users"
  | "roles"
  | "permissions"
  | "organization"
  | "clients"
  | "vehicles"
  | "inspections"
  | "checklists"
  | "items"
  | "invoices"
  | "quotations"
  | "payments_received"
  | "technicians"
  | "job_cards"
  | "expenses"
  | "reminders"
  | "banking"
  | "paperwork";

/**
 * A subject as it arrives from the API. The trailing `(string & {})` keeps a
 * subject the backend adds later from breaking the build before
 * `KnownPermissionSubject` catches up.
 */
export type PermissionSubject = KnownPermissionSubject | (string & {});

/** A permission as it appears on the user's flattened `permissions` array. */
export interface IPermission {
  action: PermissionAction;
  subject: PermissionSubject;
}

/** The full catalog record, as nested under a role. */
export interface IPermissionRecord extends IPermission {
  id: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRolePermission {
  roleId: string;
  permissionId: string;
  permission: IPermissionRecord;
}

export interface IRole {
  id: string;
  name: string;
  description: string | null;
  /** System roles ship with the org and can't be deleted. */
  isSystem: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: IRolePermission[];
}

export interface IUserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  role: IRole;
}

/** The role name that bypasses every permission check within an organization. */
export const SUPER_ADMIN_ROLE = "super_admin";

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  isActive: boolean;
  /** Platform staff, scoped to no organization — bypasses permission checks. */
  isPlatformAdmin: boolean;
  isEmailVerified: boolean;
  emailVerificationExpires: string | null;
  lastLoginAt: string;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles: IUserRole[];
  /** Flattened projection of every permission the user's roles grant. */
  permissions: IPermission[];
  organization: IOrganization;
  /**
   * Whether this user has messaged the Rabbar WhatsApp assistant at least
   * once. From /auth/me; undefined on older API versions.
   */
  hasMessagedWhatsappBot?: boolean;
}
