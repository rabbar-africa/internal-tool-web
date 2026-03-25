import Axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import {
  getToken,
  setAccessToken,
  setRefreshToken,
  removeToken,
} from "@/utils/persistToken";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import { env } from "@/shared/constants/env";

// Extend config to carry the retry flag
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// --- Queue management --------------------------------------------------
// When a token refresh is already in flight, subsequent 401s are queued.
// Once the refresh resolves they are all replayed; on failure they all reject.

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

// --- Helpers -----------------------------------------------------------

function logout() {
  removeToken();
  window.location.assign(`${window.location.origin}/auth/login`);
}

function isAuthError(status: number | undefined, data: unknown): boolean {
  if (status !== 401 && status !== 520) return false;

  const raw =
    typeof data === "string"
      ? data
      : typeof data === "object" && data !== null
        ? (((data as Record<string, unknown>).message as string | undefined) ??
          "")
        : "";

  const msg = raw.toLowerCase();
  return (
    msg === "jwt expired" ||
    msg === "please authenticate" ||
    msg === "unauthorized"
  );
}

// A bare instance used only for the refresh call.
// It has no interceptors, so a failed refresh won't re-enter this logic.
const rawAxios = Axios.create({ baseURL: env.API_BASE_URL });

// --- Exported interceptors ---------------------------------------------

export function rejectErrorInterceptor(error: AxiosError) {
  return Promise.reject(error);
}

// When responseType is 'blob', Axios gives back error.response.data as a Blob.
// This interceptor parses it back to JSON so getErrorMessage can read .message.
export async function blobErrorInterceptor(error: AxiosError) {
  if (
    error.response?.data instanceof Blob &&
    error.response.data.type === "application/json"
  ) {
    try {
      const text = await error.response.data.text();
      error.response.data = JSON.parse(text);
    } catch {
      // leave as-is if parsing fails
    }
  }
  return Promise.reject(error);
}

export function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = getToken().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers) {
    config.headers.Accept = "application/json";
  }
  return config;
}

export async function refreshTokenInterceptor(error: AxiosError) {
  const originalRequest = error.config as RetryableConfig | undefined;
  const { status, data } = error.response ?? {};

  // Not an auth error — let it propagate normally
  if (!isAuthError(status, data) || !originalRequest) {
    return Promise.reject(error);
  }

  // Already retried this request, or it IS the refresh endpoint — logout now
  if (
    originalRequest._retry ||
    originalRequest.url?.includes(QUERY_PATH.auth.refreshToken)
  ) {
    logout();
    return Promise.reject(error);
  }

  // A refresh is already in flight — queue this request and wait
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    }).then((newToken) => {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return rawAxios(originalRequest);
    });
  }

  // Mark this request so it won't be retried a second time
  originalRequest._retry = true;
  isRefreshing = true;

  const { refreshToken } = getToken();
  if (!refreshToken) {
    isRefreshing = false;
    flushQueue(error, null);
    logout();
    return Promise.reject(error);
  }

  try {
    const { data: body } = await rawAxios.post<{
      data: { accessToken: string; refreshToken: string };
    }>(QUERY_PATH.auth.refreshToken, { refreshToken });

    const newAccessToken = body.data.accessToken;
    const newRefreshToken = body.data.refreshToken;

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    // Unblock all queued requests
    flushQueue(null, newAccessToken);

    // Retry the original request with the new token
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return rawAxios(originalRequest);
  } catch (refreshError) {
    flushQueue(refreshError, null);
    logout();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
