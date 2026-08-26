import type { IRole } from "@/shared/interface/user";

/** `workshop_manager` → `Workshop Manager`. */
export const formatRoleName = (name?: string): string =>
  (name ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/** `payments_received` → `Payments Received`. */
export const formatSubject = formatRoleName;

export const roleNamesOf = (roles?: { role?: IRole }[]): string[] =>
  (roles ?? [])
    .map((entry) => formatRoleName(entry.role?.name))
    .filter(Boolean);
