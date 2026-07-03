/**
 * Follow-up countdown helpers. The dashboard shows customer care how long until
 * (or how long past) the next scheduled follow-up for a client.
 */

/** Whole-day difference between a target date and today (date-only, local). */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return NaN;
  const now = new Date();
  const t = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const n = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((t - n) / 86_400_000);
}

/** Format a day count as a plain "9 days" / "1 day". */
export function formatDays(days: number): string {
  const abs = Math.abs(days);
  return `${abs} day${abs === 1 ? "" : "s"}`;
}

export interface FollowUpCountdown {
  /** Human label, e.g. "1 week 2 days", "Due today", "Overdue by 3 days". */
  label: string;
  /** Whether the follow-up date is today or already passed. */
  isDue: boolean;
  /** No follow-up date is set. */
  isUnset: boolean;
}

export function getFollowUpCountdown(
  date: string | null | undefined,
): FollowUpCountdown {
  if (!date) return { label: "Not set", isDue: false, isUnset: true };

  const days = daysUntil(date);
  if (Number.isNaN(days)) {
    return { label: "Not set", isDue: false, isUnset: true };
  }

  if (days === 0) return { label: "Due today", isDue: true, isUnset: false };
  if (days < 0) {
    return {
      label: `Overdue by ${formatDays(days)}`,
      isDue: true,
      isUnset: false,
    };
  }
  return { label: formatDays(days), isDue: false, isUnset: false };
}

/** Add whole days to today and return a `yyyy-mm-dd` string (local time). */
export function addDaysToToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normalise an ISO datetime to the `yyyy-mm-dd` a date input expects. */
export function toDateInputValue(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
