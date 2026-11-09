import moment from "moment";
import type {
  RecurrenceUnit,
  RecurringStatus,
} from "@/shared/interface/recurring-expense";

export const RECURRING_STATUS_LABELS: Record<RecurringStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  FINISHED: "Finished",
  STOPPED: "Stopped",
};

export const RECURRING_STATUS_COLORS: Record<
  RecurringStatus,
  { bg: string; color: string }
> = {
  ACTIVE: { bg: "success.50", color: "success.300" },
  PAUSED: { bg: "warning.50", color: "warning.500" },
  FINISHED: { bg: "gray.50", color: "gray.400" },
  STOPPED: { bg: "gray.50", color: "gray.300" },
};

export const RECURRING_STATUS_OPTIONS = (
  Object.keys(RECURRING_STATUS_LABELS) as RecurringStatus[]
).map((value) => ({ label: RECURRING_STATUS_LABELS[value], value }));

export const UNIT_OPTIONS: { label: string; value: RecurrenceUnit }[] = [
  { label: "Day(s)", value: "DAY" },
  { label: "Week(s)", value: "WEEK" },
  { label: "Month(s)", value: "MONTH" },
  { label: "Year(s)", value: "YEAR" },
];

/** The common rhythms, one tap each. */
export const FREQUENCY_PICKS: {
  label: string;
  every: number;
  unit: RecurrenceUnit;
}[] = [
  { label: "Daily", every: 1, unit: "DAY" },
  { label: "Weekly", every: 1, unit: "WEEK" },
  { label: "Every 2 weeks", every: 2, unit: "WEEK" },
  { label: "Monthly", every: 1, unit: "MONTH" },
  { label: "Every 3 months", every: 3, unit: "MONTH" },
  { label: "Yearly", every: 1, unit: "YEAR" },
];

const MOMENT_UNIT: Record<
  RecurrenceUnit,
  moment.unitOfTime.DurationConstructor
> = {
  DAY: "days",
  WEEK: "weeks",
  MONTH: "months",
  YEAR: "years",
};

/**
 * The nth date from the start, counted from the start each time, so a
 * schedule started on the 31st records on the 30th in April and goes back to
 * the 31st in May, as the API does.
 */
export function nthDate(
  startDate: string,
  every: number,
  unit: RecurrenceUnit,
  n: number,
) {
  return moment(startDate, "YYYY-MM-DD")
    .add(n * every, MOMENT_UNIT[unit])
    .format("YYYY-MM-DD");
}

/** A rough preview for the form; the API's `upcoming` is the real list. */
export function previewDates({
  startDate,
  every,
  unit,
  endDate,
  maxCount,
  count = 4,
}: {
  startDate: string;
  every: number;
  unit: RecurrenceUnit;
  endDate?: string;
  maxCount?: number;
  count?: number;
}): string[] {
  if (!startDate || !every || every < 1) return [];
  const dates: string[] = [];
  for (let n = 0; dates.length < count; n++) {
    if (maxCount && n >= maxCount) break;
    const date = nthDate(startDate, every, unit, n);
    if (endDate && date > endDate) break;
    dates.push(date);
  }
  return dates;
}

/** One period on from a date: where "Make this repeat" starts. */
export const onePeriodOn = (date: string, unit: RecurrenceUnit = "MONTH") =>
  nthDate(date, 1, unit, 1);

export const formatDay = (date?: string | null, withYear = true) =>
  date
    ? moment(date.slice(0, 10), "YYYY-MM-DD").format(
        withYear ? "DD MMM YYYY" : "DD MMM",
      )
    : "—";

export const todayIso = () => moment().format("YYYY-MM-DD");

/** What each status lets you do; the API refuses the rest with a 409. */
export function recurringActions(status: RecurringStatus) {
  return {
    recordNow: status === "ACTIVE",
    pause: status === "ACTIVE",
    resume: status === "PAUSED",
    stop: status !== "STOPPED",
    edit: status !== "STOPPED",
    delete: true,
  };
}
