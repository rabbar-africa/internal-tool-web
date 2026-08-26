import { useMemo } from "react";
import type { PermissionSubject } from "@/shared/interface/user";
import {
  checkAllPermissions,
  checkAnyPermission,
  type PermissionInput,
} from "@/utils/permissions";
import { useCurrentUser } from "./useCurrentUser";

/** `"any"`: one match is enough. `"all"`: every permission must be held. */
export type PermissionMode = "any" | "all";

/**
 * Permission checks for the current user. Permissions are `action` + `subject`
 * pairs, accepted either as objects or in the compact `"read:invoices"` form.
 *
 *   const { has, canRead } = usePermissions();
 *   has("update:inspections");
 *   canRead("invoices");
 *
 * Every check mirrors the API's PermissionsGuard, so platform admins and an
 * organization's `super_admin` pass without holding the permission explicitly.
 */
export function usePermissions() {
  const { userData, userPermissions, isSuperAdmin, isLoading } =
    useCurrentUser();

  return useMemo(() => {
    const hasAll = (permissions: PermissionInput[]) =>
      checkAllPermissions(userData, permissions);

    const hasAny = (permissions: PermissionInput[]) =>
      checkAnyPermission(userData, permissions);

    const has = (permission: PermissionInput) => hasAll([permission]);

    const forSubject = (action: string) => (subject: PermissionSubject) =>
      has(`${action}:${subject}` as PermissionInput);

    return {
      /** Every permission the user holds, already de-duplicated. */
      granted: userPermissions,
      has,
      hasAll,
      hasAny,
      check: (permissions: PermissionInput[], mode: PermissionMode = "any") =>
        mode === "all" ? hasAll(permissions) : hasAny(permissions),
      canCreate: forSubject("create"),
      canRead: forSubject("read"),
      canUpdate: forSubject("update"),
      canDelete: forSubject("delete"),
      /** Bypasses every check — platform admin or the org's super_admin. */
      isSuperAdmin,
      isLoading,
    };
  }, [userData, userPermissions, isSuperAdmin, isLoading]);
}
