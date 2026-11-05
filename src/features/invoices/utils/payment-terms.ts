export const PAYMENT_TERMS_OPTIONS = [
  { label: "Due on Receipt", value: "0" },
  { label: "Net 15", value: "15" },
  { label: "Net 30", value: "30" },
  { label: "Net 45", value: "45" },
  { label: "Net 60", value: "60" },
];

/** The dropdown's value for a due date that matches none of the options. */
export const CUSTOM_TERMS = "custom";

const MS_PER_DAY = 86_400_000;

/** Calendar days, in UTC so that clock changes can't shift a date. */
const toUtc = (day: string) => new Date(`${day}T00:00:00.000Z`).getTime();

/** `day` (YYYY-MM-DD) plus some days, or null if it isn't a date yet. */
export function addDays(day: string, days: number): string | null {
  const time = toUtc(day);
  if (Number.isNaN(time)) return null;
  return new Date(time + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * The terms two dates amount to. Worked out from the dates rather than stored
 * in the form, so what an invoice prints can never contradict its due date.
 */
export function termsFromDates(
  date: string,
  dueDate: string,
): { value: string; days: number; label: string } {
  const gap = (toUtc(dueDate) - toUtc(date)) / MS_PER_DAY;
  if (Number.isNaN(gap)) {
    return { value: "0", days: 0, label: "Due on Receipt" };
  }
  const option = PAYMENT_TERMS_OPTIONS.find((o) => o.value === String(gap));
  if (option) return { value: option.value, days: gap, label: option.label };
  return gap > 0
    ? { value: CUSTOM_TERMS, days: gap, label: `Net ${gap}` }
    : { value: CUSTOM_TERMS, days: 0, label: "Custom" };
}

/** Moving the invoice date keeps the same number of days to pay. */
export function dueDateAfterDateChange(
  previousDate: string,
  nextDate: string,
  dueDate: string,
): string {
  const gap = (toUtc(dueDate) - toUtc(previousDate)) / MS_PER_DAY;
  if (Number.isNaN(gap)) return dueDate;
  return addDays(nextDate, gap) ?? dueDate;
}
