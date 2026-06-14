import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "./service";
import type { LoginCredentials } from "./types";
import {
  setAccessToken,
  setRefreshToken,
  removeToken,
} from "@/utils/persistToken";
import { toaster } from "@/components/ui";
import { getErrorMessage } from "@/utils/handle-error";
import { RouteConstants } from "@/shared/constants/routes";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      window.location.replace(RouteConstants.overview.base.path);
    },
    onError: (error) => {
      toaster.create({
        type: "error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useGetCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: () => authService.getCurrentUser(),
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

export function useLogout() {
  return () => {
    removeToken();
    window.location.replace(RouteConstants.auth.login.path);
  };
}
