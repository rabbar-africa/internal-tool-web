import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "./service";
import type { LoginCredentials, RegisterPayload } from "./types";
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

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      // Persist tokens so the optional bank/address steps can call the
      // authenticated /organizations/me/* endpoints.
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    },
    onError: (error) => {
      toaster.create({
        type: "error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
    onError: (error) => {
      toaster.create({
        type: "error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: () => authService.resendVerification(),
    onSuccess: () => {
      toaster.create({
        type: "success",
        description: "A new verification code has been sent to your email",
      });
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
