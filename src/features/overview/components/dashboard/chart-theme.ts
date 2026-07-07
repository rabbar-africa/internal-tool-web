/**
 * Shared, deliberately muted chart palette for the dashboard. Everything is
 * anchored on the brand indigo (#293885) and kept low-saturation so the
 * dashboard reads as calm and cohesive rather than loud.
 */
export const CHART = {
  collected: "#293885", // brand indigo — money in
  invoiced: "#B7BEDF", // soft indigo tint — billed
  expenses: "#C1665A", // muted terracotta — money out
  profit: "#4F9D77", // muted green — what's left
  grid: "#F1F2F5",
  axis: "#9AA1AD",
  axisLabelSize: "11px",
};

// Job-card status → muted swatch, cohesive with the invoice palette.
const JOB_CARD_STATUS_COLORS: Record<string, string> = {
  AWAITING_APPROVAL: "#D3A85C",
  APPROVED: "#6478C0",
  IN_PROGRESS: "#6478C0",
  ON_HOLD: "#AEB4BF",
  COMPLETED: "#4F9D77",
  DELIVERED: "#293885",
  CANCELLED: "#C7CCD4",
};

export function jobCardStatusColor(status: string, index = 0): string {
  return (
    JOB_CARD_STATUS_COLORS[status?.toUpperCase?.() ?? ""] ??
    STATUS_FALLBACK[index % STATUS_FALLBACK.length]
  );
}

// Invoice status → muted swatch. Unknown statuses fall back to a cohesive set.
const STATUS_COLORS: Record<string, string> = {
  PAID: "#4F9D77",
  SENT: "#6478C0",
  PARTIALLY_PAID: "#D3A85C",
  OVERDUE: "#CE7B6D",
  DRAFT: "#AEB4BF",
  VOID: "#C7CCD4",
  DELETED: "#C7CCD4",
  CANCELLED: "#C7CCD4",
};

const STATUS_FALLBACK = ["#6478C0", "#4F9D77", "#D3A85C", "#CE7B6D", "#AEB4BF"];

export function statusColor(status: string, index = 0): string {
  return (
    STATUS_COLORS[status?.toUpperCase?.() ?? ""] ??
    STATUS_FALLBACK[index % STATUS_FALLBACK.length]
  );
}

/** "PARTIALLY_PAID" → "Partially Paid" */
export function prettyStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function currencySymbol(currency: string): string {
  if (currency === "NGN") return "₦";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return `${currency} `;
}

/** Compact axis-friendly currency, e.g. ₦1.2M, ₦450k. */
export function formatCompact(val: number, currency = "NGN"): string {
  const s = currencySymbol(currency);
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${s}${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${s}${Math.round(val / 1_000)}k`;
  return `${s}${val}`;
}

/** "2025-08" → "Aug" (falls back to the raw label if unparseable). */
export function monthLabel(month: string): string {
  const [year, m] = month.split("-");
  const idx = Number(m) - 1;
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return names[idx]
    ? `${names[idx]}${year ? ` '${year.slice(2)}` : ""}`
    : month;
}
