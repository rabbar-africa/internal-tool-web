/* eslint-disable no-console */
import type { DurationType } from "@/shared/interface/time";

const storagePrefix = "hanypay_super_admin__";

export type keyType =
  | "refresh_token"
  | "access_token"
  | "auth_user"
  | "redirect_path"
  | "current_org"
  | "user_organizations";

const DEFAULT_EXPIRY_DURATION: DurationType = { unit: "DAY", value: 1 };

function getExpiresTime(payload: DurationType) {
  switch (payload.unit) {
    case "SECOND":
      return new Date().getTime() + 1000 * payload.value;
    case "MINUTE":
      return new Date().getTime() + 1000 * 60 * payload.value;
    case "HOUR":
      return new Date().getTime() + 1000 * 60 * 60 * payload.value;
    case "DAY":
      return new Date().getTime() + 1000 * 60 * 60 * 24 * payload.value;
  }
}

const storage = {
  getValue: <T = any>(key: keyType, defaultValue?: T): T | null | undefined => {
    try {
      const itemStr = window.localStorage.getItem(`${storagePrefix}${key}`);
      if (!itemStr) {
        return null;
      }
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();

      if (now > item.expiresIn) {
        storage.clearValue(key);
        return null;
      }

      return item.value;
    } catch (error: any) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  setValue: (key: keyType, value: unknown, duration?: DurationType) => {
    const item = {
      value: value,
      expiresIn: getExpiresTime(duration || DEFAULT_EXPIRY_DURATION),
    };
    window.localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(item));
  },

  clearValue: (key: keyType) => {
    window.localStorage.removeItem(`${storagePrefix}${key}`);
  },

  reset: () => {
    window.localStorage.clear();
  },

  session: {
    getValue: (key: keyType) => {
      return JSON.parse(
        sessionStorage.getItem(`${storagePrefix}${key}`) as string,
      );
    },
    setValue: (key: keyType, value: unknown) => {
      sessionStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value));
    },
    clearValue: (key: keyType) => {
      sessionStorage.removeItem(`${storagePrefix}${key}`);
    },
    reset: () => {
      window.sessionStorage.clear();
    },
  },
};

export default storage;
