import { useGetCurrentUserQuery } from "@/features/auth/api";
import { getToken } from "@/utils/persistToken";

export function useCurrentUser() {
  const isAuthenticated = Boolean(getToken()?.accessToken);

  const { data, isLoading, isError, error, isSuccess } = useGetCurrentUserQuery(
    { enabled: isAuthenticated },
  );

  const userData = data;
  const userOrganization = userData?.organization;
  const userPermissions = userData?.permissions ?? [];
  const userRole = userData?.userRoles?.[0]?.role?.name;

  const userHasPermission = (required: string[]) =>
    required.every((perm) => userPermissions.includes(perm));

  const userHasAnyPermission = (required: string[]) =>
    required.some((perm) => userPermissions.includes(perm));

  return {
    isAuthenticated,
    isLoading,
    isError,
    error,
    isSuccess,
    userData,
    userOrganization,
    userPermissions,
    userRole,
    userHasPermission,
    userHasAnyPermission,
  };
}
