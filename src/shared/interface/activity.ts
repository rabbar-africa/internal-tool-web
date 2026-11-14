/** The activity log: GET /activity (docs/ACTIVITY_LOG_PLAN.md in the API). */

export type ActivitySource =
  | "WEB"
  | "WHATSAPP"
  | "BACK_OFFICE"
  | "SCHEDULED"
  | "WEBHOOK"
  | "IMPORT";

export type ActivityEntityType =
  | "invoice"
  | "quotation"
  | "payment"
  | "credit_note"
  | "expense"
  | "transfer"
  | "bank_account"
  | "tax";

export type ActivityValue = string | number | boolean | null;

/** An edit: old → new, or only that a personal detail changed. */
export type ActivityChange =
  | { field: string; from: ActivityValue; to: ActivityValue }
  | { field: string; changed: true };

export interface ActivityRelated {
  type: ActivityEntityType | "customer" | "job_card";
  id: string;
  label?: string | null;
}

export interface IActivityEntry {
  id: string;
  occurredAt: string;
  /** e.g. "invoice.deleted" */
  action: string;
  entityType: ActivityEntityType;
  entityId: string | null;
  entityLabel: string | null;
  summary: string;
  changes: ActivityChange[] | null;
  related: ActivityRelated[] | null;
  source: ActivitySource;
  actor: {
    type: "USER" | "PLATFORM_ADMIN" | "SYSTEM";
    userId: string | null;
    /** "Rabbar support" for Rabbar staff, "Automatic" for scheduled work. */
    name: string | null;
    role: string | null;
  };
}

export interface IActivityPage {
  items: IActivityEntry[];
  nextCursor: string | null;
  /** Without full history on the plan, the log starts this many days back. */
  history: {
    limitedToDays: number | null;
    upgradeTo?: string;
    message?: string;
  };
}

export interface IActivityFilter {
  from?: string;
  to?: string;
  actorUserId?: string;
  source?: ActivitySource;
  /** One or several, comma-separated. */
  action?: string;
  entityType?: ActivityEntityType;
  entityId?: string;
  search?: string;
  limit?: number;
}
