import Axios from "axios";
import { env } from "@/shared/constants/env";
import { RouteConstants } from "@/shared/constants/routes";
import { getToken, removeToken } from "./persistToken";

/**
 * Signing out (docs/frontend-sign-out.md). The API ends a session on its
 * side too, so a copied refresh token stops working, and it refuses a token
 * whose session was ended elsewhere (a password reset, "sign out
 * everywhere", the account deactivated).
 */

/** No interceptors: signing out must never trigger a refresh. */
const bare = Axios.create({ baseURL: env.API_BASE_URL, timeout: 3000 });

/** How long sign-out waits for the API before leaving anyway. */
const SIGN_OUT_WAIT_MS = 1500;

/** The API's words when it refuses a session; shown on the sign-in page. */
export const SESSION_ENDED_MESSAGES = [
  "Your session has ended. Sign in again.",
  "Account is deactivated",
] as const;

const REASON_KEY = "rabbar.signOutReason";

/** Whether a 401's message means the session is over (not just expired). */
export const isSessionEnded = (message: unknown): message is string =>
  typeof message === "string" &&
  (SESSION_ENDED_MESSAGES as readonly string[]).includes(message);

/** Kept for the sign-in page, which says why the person was signed out. */
export function rememberSignOutReason(message: unknown) {
  if (!isSessionEnded(message)) return;
  try {
    sessionStorage.setItem(REASON_KEY, message);
  } catch {
    // Private mode or blocked storage: the page just won't say why.
  }
}

/**
 * The reason, once: read and forgotten (signing out reloads the page, so
 * it's kept for this page only, where a re-render may ask again).
 */
let taken: string | null | undefined;
export function takeSignOutReason(): string | null {
  if (taken !== undefined) return taken;
  try {
    const reason = sessionStorage.getItem(REASON_KEY);
    sessionStorage.removeItem(REASON_KEY);
    taken =
      reason === "Account is deactivated"
        ? "Your account has been deactivated. Ask an admin on your team if you think this is a mistake."
        : reason;
  } catch {
    taken = null;
  }
  return taken;
}

/** Clears this browser and goes to sign-in. */
export function leaveToSignIn(reason?: unknown) {
  rememberSignOutReason(reason);
  removeToken();
  window.location.replace(RouteConstants.auth.login.path);
}

/**
 * Ends this device's session on the API (it always answers 200, even with no
 * token), waiting a moment at most, then clears the browser.
 */
export async function endThisSession() {
  const { refreshToken } = getToken();
  if (refreshToken) {
    await Promise.race([
      bare.post("auth/logout", { refreshToken }).catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, SIGN_OUT_WAIT_MS)),
    ]);
  }
  removeToken();
}

/** Log out of this device, then sign-in. */
export async function signOut() {
  await endThisSession();
  leaveToSignIn();
}
