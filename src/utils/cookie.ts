/* eslint-disable no-console */
import type { DurationType } from "@/shared/interface/time";

const cookiePrefix = "hanypay_super_admin__";

export type CookieKeyType =
  | "refresh_token"
  | "access_token"
  | "redirect_path"
  | "current_org"
  | "user_organizations";

export interface CookieOptions {
  duration?: DurationType;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
}

const DEFAULT_EXPIRY_DURATION: DurationType = { unit: "DAY", value: 1 };

function getExpiresTime(payload: DurationType): Date {
  const now = new Date();
  switch (payload.unit) {
    case "SECOND":
      now.setSeconds(now.getSeconds() + payload.value);
      break;
    case "MINUTE":
      now.setMinutes(now.getMinutes() + payload.value);
      break;
    case "HOUR":
      now.setHours(now.getHours() + payload.value);
      break;
    case "DAY":
      now.setDate(now.getDate() + payload.value);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }

  return now;
}

function serializeCookie(
  key: string,
  value: string,
  options: CookieOptions = {},
): string {
  const {
    duration = DEFAULT_EXPIRY_DURATION,
    secure = true,
    sameSite = "strict",
    path = "/",
    domain,
  } = options;

  let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  const expires = getExpiresTime(duration);
  cookie += `; expires=${expires.toUTCString()}`;

  cookie += `; path=${path}`;

  if (domain) {
    cookie += `; domain=${domain}`;
  }

  if (secure) {
    cookie += "; secure";
  }

  cookie += `; samesite=${sameSite}`;

  return cookie;
}

function parseCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  const cookieName = encodeURIComponent(`${cookiePrefix}${name}`);

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(`${cookieName}=`)) {
      const value = cookie.substring(cookieName.length + 1);
      return decodeURIComponent(value);
    }
  }

  return null;
}

const cookie = {
  /**
   * Get a cookie value and parse it as JSON
   * @param key - The cookie key
   * @param defaultValue - Optional default value if cookie doesn't exist
   * @returns The parsed cookie value or null
   */
  getValue: <T = any>(key: CookieKeyType, defaultValue?: T): T | null => {
    try {
      const cookieValue = parseCookie(key);

      if (!cookieValue) {
        return defaultValue ?? null;
      }

      return JSON.parse(cookieValue) as T;
    } catch (error: any) {
      console.warn(`Error reading cookie "${key}":`, error);
      return defaultValue ?? null;
    }
  },

  /**
   * Get a raw cookie value without JSON parsing
   * @param key - The cookie key
   * @returns The raw cookie value or null
   */
  getRawValue: (key: CookieKeyType): string | null => {
    try {
      return parseCookie(key);
    } catch (error: any) {
      console.warn(`Error reading cookie "${key}":`, error);
      return null;
    }
  },

  /**
   * Set a cookie value with optional configuration
   * @param key - The cookie key
   * @param value - The value to store (will be JSON stringified)
   * @param options - Optional cookie configuration
   */
  setValue: (
    key: CookieKeyType,
    value: unknown,
    options?: CookieOptions,
  ): void => {
    try {
      const serializedValue = JSON.stringify(value);
      const cookieString = serializeCookie(
        `${cookiePrefix}${key}`,
        serializedValue,
        options,
      );
      document.cookie = cookieString;
    } catch (error: any) {
      console.error(`Error setting cookie "${key}":`, error);
    }
  },

  /**
   * Set a raw cookie value without JSON stringification
   * @param key - The cookie key
   * @param value - The raw string value to store
   * @param options - Optional cookie configuration
   */
  setRawValue: (
    key: CookieKeyType,
    value: string,
    options?: CookieOptions,
  ): void => {
    try {
      const cookieString = serializeCookie(
        `${cookiePrefix}${key}`,
        value,
        options,
      );
      document.cookie = cookieString;
    } catch (error: any) {
      console.error(`Error setting cookie "${key}":`, error);
    }
  },

  /**
   * Delete a specific cookie
   * @param key - The cookie key to delete
   * @param path - Optional path (should match the path used when setting)
   * @param domain - Optional domain (should match the domain used when setting)
   */
  clearValue: (
    key: CookieKeyType,
    path: string = "/",
    domain?: string,
  ): void => {
    try {
      let cookie = `${encodeURIComponent(`${cookiePrefix}${key}`)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

      if (domain) {
        cookie += `; domain=${domain}`;
      }

      document.cookie = cookie;
    } catch (error: any) {
      console.error(`Error clearing cookie "${key}":`, error);
    }
  },

  /**
   * Check if a cookie exists
   * @param key - The cookie key
   * @returns True if the cookie exists
   */
  exists: (key: CookieKeyType): boolean => {
    return parseCookie(key) !== null;
  },

  /**
   * Get all cookies with the app prefix
   * @returns Object with all app cookies
   */
  getAll: (): Record<string, any> => {
    const result: Record<string, any> = {};
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const [name, value] = cookie.split("=");

      if (name.startsWith(encodeURIComponent(cookiePrefix))) {
        const key = decodeURIComponent(name).replace(cookiePrefix, "");
        try {
          result[key] = JSON.parse(decodeURIComponent(value));
        } catch {
          result[key] = decodeURIComponent(value);
        }
      }
    }

    return result;
  },

  /**
   * Clear all cookies with the app prefix
   * @param path - Optional path (should match the path used when setting)
   * @param domain - Optional domain (should match the domain used when setting)
   */
  reset: (path: string = "/", domain?: string): void => {
    const allCookies = cookie.getAll();
    Object.keys(allCookies).forEach((key) => {
      cookie.clearValue(key as CookieKeyType, path, domain);
    });
  },
};

export default cookie;
