import moment from "moment";
import { formatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ReportCell,
  ReportColumnType,
  ReportDrill,
  ReportRecordType,
} from "@/shared/interface/report";

const asNumber = (value: ReportCell): number | null => {
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** A cell as the screen shows it, by its column's type. */
export function formatCell(
  value: ReportCell | undefined,
  type: ReportColumnType,
  currency: string,
): string {
  if (value === null || value === undefined || value === "") return "";
  switch (type) {
    case "money": {
      const n = asNumber(value);
      if (n === null) return String(value);
      const text = formatMoney(Math.abs(n), { currencyCode: currency });
      return n < 0 ? `-${text}` : text;
    }
    case "count": {
      const n = asNumber(value);
      return n === null ? String(value) : whole.format(n);
    }
    case "number": {
      const n = asNumber(value);
      return n === null ? String(value) : decimal.format(n);
    }
    case "percent": {
      const n = asNumber(value);
      return n === null ? String(value) : `${decimal.format(n)}%`;
    }
    case "date":
      return moment(String(value), "YYYY-MM-DD").format("DD MMM YYYY");
    default:
      return String(value);
  }
}

/** Figures line up on the right; words and dates read from the left. */
export const alignOf = (type: ReportColumnType) =>
  type === "text" || type === "date" ? "start" : "end";

export const isNegative = (
  value: ReportCell | undefined,
  type: ReportColumnType,
) => type === "money" && (asNumber(value ?? null) ?? 0) < 0;

/** Where a record opens, or null when it has no page of its own. */
export function recordHref(type: ReportRecordType, id: string): string | null {
  switch (type) {
    case "invoice":
      return RouteConstants.invoices.detail.generate({ id });
    case "payment":
      return RouteConstants.payments.detail.generate({ id });
    case "credit_note":
      return RouteConstants.creditNotes.detail.generate({ id });
    case "expense":
      return RouteConstants.expenses.edit.generate({ id });
    case "customer":
      return RouteConstants.customers.detail.generate({ id });
    case "job_card":
      return RouteConstants.jobCards.detail.generate({ id });
    // Vehicles and items have no page of their own yet.
    default:
      return null;
  }
}

/**
 * Where a row leads: another report narrowed to it, on the same period, or
 * the record itself. Null when there is nowhere to go.
 */
export function drillHref(
  drill: ReportDrill | undefined,
  periodSearch: URLSearchParams,
): string | null {
  if (!drill) return null;
  if ("record" in drill) return recordHref(drill.record.type, drill.record.id);
  const search = new URLSearchParams(periodSearch);
  Object.entries(drill.filters ?? {}).forEach(([key, value]) =>
    search.set(key, value),
  );
  const query = search.toString();
  return `${RouteConstants.reports.view.generate({ key: drill.report })}${
    query ? `?${query}` : ""
  }`;
}

/** "BANK_TRANSFER" → "Bank transfer", for options the API sends as codes. */
export const humanise = (code: string) => {
  const text = code.replace(/[_-]+/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** "STANDARD" → "Standard". */
export const planName = (tier: string) => humanise(tier);
