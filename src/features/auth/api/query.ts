import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "./service";
import type {
  AcceptInvitePayload,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
} from "./types";
import {
  setAccessToken,
  setRefreshToken,
  removeToken,
} from "@/utils/persistToken";
import { toaster } from "@/components/ui";
import { RouteConstants } from "@/shared/constants/routes";
import { customQueryKey } from "@/shared/constants/query-keys";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      window.location.replace(RouteConstants.overview.base.path);
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
  });
}

/** Validates the invite token behind the accept page. */
export function useValidateInviteQuery(token: string) {
  return useQuery({
    queryKey: [customQueryKey.user.validateInvite, token],
    queryFn: () => authService.validateInvite(token),
    enabled: !!token,
    retry: false,
  });
}

/**
 * Accepting an invite creates the account and returns a session, so the tokens
 * are persisted here and the user lands inside the app already signed in.
 */
export function useAcceptInviteMutation() {
  return useMutation({
    mutationFn: (payload: AcceptInvitePayload) =>
      authService.acceptInvite(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      window.location.replace(RouteConstants.overview.base.path);
    },
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
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
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
    onSuccess: () => {
      toaster.create({
        type: "success",
        description: "If that email is registered, a reset code is on its way",
      });
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword(payload),
    onSuccess: () => {
      toaster.create({
        type: "success",
        description: "Password reset. You can now sign in.",
      });
    },
  });
}

export function useGetCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [customQueryKey.user.getMe],
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

export const useGetCurrentSubscriptionQuery = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [customQueryKey.user.getCurrentSubscription],
    queryFn: () => authService.getCurrentSubscription(),
    enabled: options?.enabled ?? true,
    retry: false,
  });
};
