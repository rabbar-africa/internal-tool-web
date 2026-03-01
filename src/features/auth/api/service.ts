import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
} from "./types";

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

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axios.post<{ data: RefreshTokenResponse }>(
      QUERY_PATH.auth.refreshToken,
      { refreshToken },
    );
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(QUERY_PATH.auth.getCurrentUser);
    return response.data.data;
  },
};
