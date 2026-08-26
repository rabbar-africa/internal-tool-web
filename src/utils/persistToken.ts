import type { DurationType } from "@/shared/interface/time";
import cookie from "./cookie";
import { access_token, refresh_token } from "@/shared/constants/storage";

export function getToken() {
  const accessToken = cookie.getValue<string>(access_token);
  const refreshToken = cookie.getValue<string>(refresh_token);

  return {
    accessToken,
    refreshToken,
  };
}

/** Without a `duration` the cookie is a session cookie — no expiry is set. */
export function setAccessToken(token: string, duration?: DurationType) {
  cookie.setValue(access_token, token, { duration });
}

/** Without a `duration` the cookie is a session cookie — no expiry is set. */
export function setRefreshToken(token: string, duration?: DurationType) {
  cookie.setValue(refresh_token, token, { duration });
}

export function removeToken() {
  cookie.clearValue(access_token);
  cookie.clearValue(refresh_token);
}
