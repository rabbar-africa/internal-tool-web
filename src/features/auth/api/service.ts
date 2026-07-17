import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  Subscription,
} from "./types";
import { type ApiResponse } from "@/shared/interface/api";
import { type IUser } from "@/shared/interface/user";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post<{ data: LoginResponse }>(
      QUERY_PATH.auth.login,
      {
        email: credentials.email.trim(),
        password: credentials.password,
      },
    );
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axios.post<{ data: RegisterResponse }>(
      QUERY_PATH.auth.register,
      payload,
    );
    return response.data.data;
  },

  verifyEmail: async (code: string): Promise<IUser> => {
    const response = await axios.post<{ data: IUser }>(
      QUERY_PATH.auth.verifyEmail,
      { code },
    );
    return response.data.data;
  },

  resendVerification: async (): Promise<void> => {
    await axios.post(QUERY_PATH.auth.resendVerification);
  },

  /** Emails a 6-digit reset OTP to the account with this email. */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await axios.post(QUERY_PATH.auth.forgotPassword, {
      email: payload.email.trim().toLowerCase(),
    });
  },

  /** Confirms the emailed OTP and sets the new password. */
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await axios.post(QUERY_PATH.auth.resetPassword, {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
      password: payload.password,
    });
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axios.post<{ data: LoginResponse }>(
      QUERY_PATH.auth.refreshToken,
      { refreshToken },
    );
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get<ApiResponse<IUser>>(
      QUERY_PATH.auth.getCurrentUser,
    );
    return response.data.data;
  },

  getCurrentSubscription: async (): Promise<Subscription | null> => {
    const response = await axios.get<ApiResponse<Subscription | null>>(
      QUERY_PATH.auth.getCurrentSubscription,
    );
    return response.data.data;
  },
};
