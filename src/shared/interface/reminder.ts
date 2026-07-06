import type { IBaseFilter } from "./filter";

export type ReminderStatus = "PENDING" | "COMPLETED" | "DISMISSED";

/** Well-known reminder types. `type` is free-form (stored UPPERCASE), so any
 * custom string is valid — these are the ones the UI gives first-class views to. */
export const REMINDER_TYPES = {
  SERVICE: "SERVICE",
  FOLLOW_UP: "FOLLOW_UP",
  PAPERWORK: "PAPERWORK",
  INSURANCE: "INSURANCE",
} as const;

export type KnownReminderType =
  (typeof REMINDER_TYPES)[keyof typeof REMINDER_TYPES];

/** Free-form, but narrowed to the known set for editor convenience. */
export type ReminderType = KnownReminderType | (string & {});

export interface ReminderClient {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string | null;
  email: string | null;
}

export interface ReminderVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

export interface Reminder {
  id: string;
  organizationId: string;
  type: ReminderType;
  title: string;
  notes: string | null;
  status: ReminderStatus;
  dueDate: string; // "YYYY-MM-DD"
  dueMileage: number | null;
  clientId: string | null;
  vehicleId: string | null;
  sourceType: string | null;
  sourceId: string | null;
  intervalMonths: number | null;
  intervalDays: number | null;
  intervalMileage: number | null;
  remindedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: ReminderClient | null;
  vehicle?: ReminderVehicle | null;
  // Present on GET /:id, GET /upcoming, PUT /:id — computed server-side.
  dueInDays?: number; // negative = overdue
  isOverdue?: boolean;
}

export interface CreateReminderPayload {
  type: ReminderType;
  title: string;
  dueDate: string; // "YYYY-MM-DD"
  notes?: string;
  dueMileage?: number;
  clientId?: string | null;
  vehicleId?: string | null;
  intervalMonths?: number;
  intervalDays?: number;
  intervalMileage?: number;
}

/** Any subset of the create fields; pass clientId/vehicleId: null to unlink. */
export type UpdateReminderPayload = Partial<CreateReminderPayload>;

export interface CompleteReminderPayload {
  completedDate?: string;
  nextDueDate?: string;
  notes?: string;
}

/** POST /reminders/:id/complete → the completed reminder plus the auto-created
 * next occurrence (if the reminder was recurring). */
export interface CompleteReminderResponse {
  completed: Reminder;
  next: Reminder | null;
}

export interface IGetReminderFilter extends IBaseFilter {
  type?: string;
  status?: ReminderStatus;
  clientId?: string;
  vehicleId?: string;
  overdue?: boolean;
  dueBefore?: string; // "YYYY-MM-DD"
  dueAfter?: string; // "YYYY-MM-DD"
}

export interface IGetUpcomingRemindersFilter {
  type?: string;
  withinDays?: number; // default 30
  limit?: number; // default 10
  includeOverdue?: boolean; // default true
  clientId?: string;
  vehicleId?: string;
}

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  DISMISSED: "Dismissed",
};

export const REMINDER_STATUS_OPTIONS = (
  Object.keys(REMINDER_STATUS_LABELS) as ReminderStatus[]
).map((value) => ({ label: REMINDER_STATUS_LABELS[value], value }));

export const REMINDER_TYPE_LABELS: Record<KnownReminderType, string> = {
  SERVICE: "Service",
  FOLLOW_UP: "Follow-up",
  PAPERWORK: "Paperwork",
  INSURANCE: "Insurance",
};

export const REMINDER_TYPE_OPTIONS = (
  Object.keys(REMINDER_TYPE_LABELS) as KnownReminderType[]
).map((value) => ({ label: REMINDER_TYPE_LABELS[value], value }));

/** Human label for any type, including custom ones (Title-cases the raw value). */
export const reminderTypeLabel = (type: string): string =>
  REMINDER_TYPE_LABELS[type as KnownReminderType] ??
  type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
