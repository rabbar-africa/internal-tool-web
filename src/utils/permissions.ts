import {
  SUPER_ADMIN_ROLE,
  type IPermission,
  type IUser,
  type PermissionAction,
  type PermissionSubject,
} from "@/shared/interface/user";

/**
 * A permission to check for, either as an object or as the compact
 * `"action:subject"` form that reads better inline — `can("read:invoices")`.
 */
export type PermissionInput = IPermission | `${PermissionAction}:${string}`;

const toKey = (action: string, subject: string) => `${action}:${subject}`;

export function normalizePermission(input: PermissionInput): IPermission {
  if (typeof input !== "string") return input;
  const [action, subject] = input.split(":");
  return {
    action: action as PermissionAction,
    subject: subject as PermissionSubject,
  };
}

/**
 * Every permission the user holds, mirroring the API's PermissionsGuard: only
 * roles belonging to the user's own organization count. The flattened
 * `permissions` projection is folded in too, since some endpoints return that
 * without the nested roles.
 */
export function collectPermissions(user?: IUser | null): IPermission[] {
  if (!user) return [];

  const fromRoles = (user.userRoles ?? [])
    .filter(
      (userRole) =>
        !user.organizationId ||
        userRole.role?.organizationId === user.organizationId,
    )
    .flatMap((userRole) =>
      (userRole.role?.rolePermissions ?? []).map((rolePermission) => ({
        action: rolePermission.permission.action,
        subject: rolePermission.permission.subject,
      })),
    );

  const seen = new Set<string>();
  return [...fromRoles, ...(user.permissions ?? [])].filter((permission) => {
    if (!permission?.action || !permission?.subject) return false;
    const key = toKey(permission.action, permission.subject);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Roles the user holds inside their own organization. */
export function collectRoles(user?: IUser | null): string[] {
  if (!user) return [];
  return (user.userRoles ?? [])
    .filter(
      (userRole) =>
        !user.organizationId ||
        userRole.role?.organizationId === user.organizationId,
    )
    .map((userRole) => userRole.role?.name)
    .filter(Boolean);
}

/**
 * Whether permission checks are skipped entirely. The API grants this to
 * platform staff (who belong to no organization) and to an organization's
 * `super_admin`, so the UI has to agree or it will hide things the API allows.
 */
export function hasFullAccess(user?: IUser | null): boolean {
  if (!user) return false;
  if (user.isPlatformAdmin || !user.organizationId) return true;
  return collectRoles(user).includes(SUPER_ADMIN_ROLE);
}

/** True when the user holds every one of `required`. Empty means no gate. */
export function checkAllPermissions(
  user: IUser | null | undefined,
  required: PermissionInput[],
): boolean {
  if (!required.length) return true;
  if (hasFullAccess(user)) return true;

  const held = new Set(
    collectPermissions(user).map((p) => toKey(p.action, p.subject)),
  );
  return required
    .map(normalizePermission)
    .every((p) => held.has(toKey(p.action, p.subject)));
}

/** True when the user holds at least one of `required`. */
export function checkAnyPermission(
  user: IUser | null | undefined,
  required: PermissionInput[],
): boolean {
  if (!required.length) return true;
  if (hasFullAccess(user)) return true;

  const held = new Set(
    collectPermissions(user).map((p) => toKey(p.action, p.subject)),
  );
  return required
    .map(normalizePermission)
    .some((p) => held.has(toKey(p.action, p.subject)));
}
