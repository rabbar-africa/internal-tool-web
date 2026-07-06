import moment from "moment";
import type { Reminder } from "@/shared/interface/reminder";

/** Whole days from today (local) until the due date. Negative = overdue. */
export const computeDueInDays = (dueDate: string): number =>
  moment(dueDate, "YYYY-MM-DD")
    .startOf("day")
    .diff(moment().startOf("day"), "days");

/** Prefer the server-computed value (present on /:id, /upcoming, PUT), else derive. */
export const getDueInDays = (reminder: Reminder): number =>
  typeof reminder.dueInDays === "number"
    ? reminder.dueInDays
    : computeDueInDays(reminder.dueDate);

export const isReminderOverdue = (reminder: Reminder): boolean =>
  typeof reminder.isOverdue === "boolean"
    ? reminder.isOverdue
    : getDueInDays(reminder) < 0;

export const formatDueDate = (dueDate?: string | null): string =>
  dueDate ? moment(dueDate, "YYYY-MM-DD").format("DD MMM YYYY") : "—";

/** Human phrase for a due countdown: "Overdue by 3d", "Due today", "In 5d". */
export const formatDueInDays = (days: number): string => {
  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days}d`;
};

export interface DueBadgeMeta {
  label: string;
  color: string;
  bg: string;
}

/** Red when overdue/today, amber within a week, otherwise a calm green/gray. */
export const getDueBadgeMeta = (days: number): DueBadgeMeta => {
  if (days < 0)
    return { label: formatDueInDays(days), color: "red.600", bg: "red.50" };
  if (days === 0) return { label: "Due today", color: "red.600", bg: "red.50" };
  if (days <= 7)
    return {
      label: formatDueInDays(days),
      color: "orange.600",
      bg: "orange.50",
    };
  return { label: formatDueInDays(days), color: "green.600", bg: "green.50" };
};

/** "Toyota Corolla • ABC 123 XY" from whichever vehicle fields are set. */
export const reminderVehicleLabel = (reminder: Reminder): string => {
  const v = reminder.vehicle;
  if (!v) return "";
  const name = [v.make, v.model].filter(Boolean).join(" ");
  return [name, v.registrationNumber].filter(Boolean).join(" • ");
};
