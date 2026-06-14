import { useGetCurrentUserQuery } from "@/features/auth/api";
import { useGetOrganizationDetails } from "@/features/settings/api";
import { getToken } from "@/utils/persistToken";

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

  const userData = data;
  const userOrganization = orgData?.data;
  const userPermissions = userData?.permissions ?? [];
  const userRole = userData?.userRoles?.[0]?.role?.name;

  const userHasPermission = (required: string[]) =>
    required.every((perm) => userPermissions.includes(perm));

  const userHasAnyPermission = (required: string[]) =>
    required.some((perm) => userPermissions.includes(perm));

  return {
    isAuthenticated,
    isLoading: isLoading || orgDataLoading,
    isError: isError || orgIsError,
    error: error || orgError,
    isSuccess: isSuccess || orgSuccess,
    userData,
    userOrganization,
    userPermissions,
    userRole,
    userHasPermission,
    userHasAnyPermission,
  };
}
