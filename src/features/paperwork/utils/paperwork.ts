import type { PaperworkStatus } from "@/shared/interface/paperwork";

/** Common Nigerian vehicle document types — presets, not a closed list. */
export const DOCUMENT_TYPE_OPTIONS = [
  { label: "Full Paperwork", value: "FULL_PAPERWORK" },
  { label: "Road Worthiness", value: "ROAD_WORTHINESS" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "Vehicle Registration", value: "VEHICLE_REGISTRATION" },
  { label: "Vehicle License", value: "VEHICLE_LICENSE" },
  { label: "Hackney Permit", value: "HACKNEY_PERMIT" },
  { label: "Proof of Ownership", value: "PROOF_OF_OWNERSHIP" },
];

export const CUSTOM_DOCUMENT_TYPE = "__CUSTOM__";

/** Turn a raw documentType (ROAD_WORTHINESS or free text) into a readable label. */
export function formatDocumentType(raw?: string | null): string {
  if (!raw) return "—";
  const preset = DOCUMENT_TYPE_OPTIONS.find((o) => o.value === raw);
  if (preset) return preset.label;
  return raw
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const STATUS_META: Record<
  PaperworkStatus,
  { label: string; color: string; bg: string }
> = {
  VALID: { label: "Valid", color: "green.600", bg: "green.50" },
  EXPIRING_SOON: {
    label: "Expiring soon",
    color: "orange.600",
    bg: "orange.50",
  },
  EXPIRED: { label: "Expired", color: "red.600", bg: "red.50" },
  NO_EXPIRY: { label: "No expiry", color: "gray.500", bg: "gray.100" },
};

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Human phrase for the derived daysUntilExpiry (negative = overdue). */
export function formatDaysUntil(days: number | null | undefined): string {
  if (days === null || days === undefined) return "";
  if (days < 0) {
    const n = Math.abs(days);
    return `${n} day${n === 1 ? "" : "s"} overdue`;
  }
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
