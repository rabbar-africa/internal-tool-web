import { useMemo } from "react";
import { useGetCurrentUserQuery } from "@/features/auth/api";
import { useGetOrganizationDetails } from "@/features/settings/api";
import type { IUser } from "@/shared/interface/user";
import { getToken } from "@/utils/persistToken";
import {
  checkAllPermissions,
  checkAnyPermission,
  collectPermissions,
  collectRoles,
  hasFullAccess,
  type PermissionInput,
} from "@/utils/permissions";

export function useCurrentUser() {
  const isAuthenticated = Boolean(getToken()?.accessToken);

  const { data, isLoading, isError, error, isSuccess } = useGetCurrentUserQuery(
    { enabled: isAuthenticated },
  );

  const {
    data: orgData,
    isLoading: orgDataLoading,
    isError: orgIsError,
    error: orgError,
    isSuccess: orgSuccess,
  } = useGetOrganizationDetails({ enabled: isAuthenticated });

  const userData = data as IUser | undefined;
  const userOrganization = orgData?.data;

  const { userPermissions, userRoles, userRole, isSuperAdmin } = useMemo(
    () => ({
      userPermissions: collectPermissions(userData),
      userRoles: collectRoles(userData),
      userRole: collectRoles(userData)[0],
      isSuperAdmin: hasFullAccess(userData),
    }),
    [userData],
  );

  /** True only when the user holds every permission listed. */
  const userHasPermission = (required: PermissionInput[]) =>
    checkAllPermissions(userData, required);

  /** True when the user holds at least one of the permissions listed. */
  const userHasAnyPermission = (required: PermissionInput[]) =>
    checkAnyPermission(userData, required);

  /** Single check — `can("read", "invoices")` or `can("read:invoices")`. */
  const can = (action: PermissionInput, subject?: string): boolean =>
    checkAllPermissions(userData, [
      subject && typeof action === "string"
        ? (`${action}:${subject}` as PermissionInput)
        : action,
    ]);

  return {
    isAuthenticated,
    isLoading: isLoading || orgDataLoading,
    isError: isError || orgIsError,
    error: error || orgError,
    isSuccess: isSuccess || orgSuccess,
    userData,
    userOrganization,
    userPermissions,
    userRoles,
    userRole,
    /** Bypasses every check — platform admin or the org's super_admin. */
    isSuperAdmin,
    can,
    userHasPermission,
    userHasAnyPermission,
  };
}
