import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
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
};
