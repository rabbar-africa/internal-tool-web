import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import type {
  ReportBasis,
  ReportCatalogEntry,
  ReportParams,
} from "@/shared/interface/report";

export type RangePreset =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-year"
  | "last-year"
  | "custom";

export const RANGE_PRESETS: { label: string; value: RangePreset }[] = [
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "This quarter", value: "this-quarter" },
  { label: "This year", value: "this-year" },
  { label: "Last year", value: "last-year" },
  { label: "Custom", value: "custom" },
];

const DAY = "YYYY-MM-DD";
const today = () => moment().format(DAY);

export interface DayRange {
  from: string;
  to: string;
}

/** The days a preset stands for; "this…" presets run up to today. */
export function presetRange(preset: Exclude<RangePreset, "custom">): DayRange {
  const now = moment();
  switch (preset) {
    case "last-month": {
      const last = now.clone().subtract(1, "month");
      return {
        from: last.clone().startOf("month").format(DAY),
        to: last.clone().endOf("month").format(DAY),
      };
    }
    case "this-quarter":
      return {
        from: now.clone().startOf("quarter").format(DAY),
        to: now.format(DAY),
      };
    case "this-year":
      return {
        from: now.clone().startOf("year").format(DAY),
        to: now.format(DAY),
      };
    case "last-year": {
      const last = now.clone().subtract(1, "year");
      return {
        from: last.clone().startOf("year").format(DAY),
        to: last.clone().endOf("year").format(DAY),
      };
    }
    default:
      return {
        from: now.clone().startOf("month").format(DAY),
        to: now.format(DAY),
      };
  }
}

const isPreset = (value: string | null): value is RangePreset =>
  RANGE_PRESETS.some((p) => p.value === value);

/**
 * VAT is filed for a finished month, so the VAT reports open on last month
 * (docs/frontend-vat.md); every other report on this month.
 */
const LAST_MONTH_FIRST = new Set(["vat_summary", "vat_return"]);
const defaultPresetOf = (key: string | undefined): RangePreset =>
  key && LAST_MONTH_FIRST.has(key) ? "last-month" : "this-month";

/** URL keys that aren't the report's own filters. */
const PERIOD_KEYS = ["preset", "from", "to", "asOf"] as const;

/**
 * A report's period, basis and filters, kept in the URL (like the Banking
 * page's range) so a reload, a shared link and a drill-down keep them.
 * `preset` is recomputed on each visit ("this month" moves); a custom range
 * and an "as of" day are stored as days.
 */
export function useReportParams(entry: ReportCatalogEntry | undefined) {
  const [search, setSearch] = useSearchParams();

  const defaultPreset = defaultPresetOf(entry?.key);
  const rawPreset = search.get("preset");
  const preset: RangePreset = isPreset(rawPreset) ? rawPreset : defaultPreset;
  const range = useMemo<DayRange>(() => {
    if (preset !== "custom") return presetRange(preset);
    const fallback = presetRange(
      defaultPreset === "custom" ? "this-month" : defaultPreset,
    );
    return {
      from: search.get("from") || fallback.from,
      to: search.get("to") || fallback.to,
    };
  }, [preset, defaultPreset, search]);
  const asOf = search.get("asOf") || today();

  const basisOptions = entry?.basis ?? [];
  const rawBasis = search.get("basis") as ReportBasis | null;
  const basis: ReportBasis | null =
    rawBasis && basisOptions.includes(rawBasis)
      ? rawBasis
      : (basisOptions[0] ?? null);

  // Only what this report declares; anything else in the URL is ignored.
  const filters = useMemo(() => {
    const out: Record<string, string> = {};
    (entry?.filters ?? []).forEach((f) => {
      const value = search.get(f.key);
      if (value) out[f.key] = value;
    });
    return out;
  }, [entry?.filters, search]);

  /** Sent to the API, and the same for the screen, PDF and files. */
  const apiParams = useMemo<ReportParams>(() => {
    if (!entry) return {};
    return {
      ...(entry.period === "asOf"
        ? { asOf }
        : { from: range.from, to: range.to }),
      ...(basis ? { basis } : {}),
      ...filters,
    };
  }, [entry, asOf, range.from, range.to, basis, filters]);

  const update = useCallback(
    (changes: Record<string, string | null>) =>
      setSearch(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
          });
          return next;
        },
        { replace: true },
      ),
    [setSearch],
  );

  const setRange = (next: { preset: RangePreset } & Partial<DayRange>) =>
    update({
      preset: next.preset === defaultPreset ? null : next.preset,
      from: next.preset === "custom" ? (next.from ?? range.from) : null,
      to: next.preset === "custom" ? (next.to ?? range.to) : null,
    });
  const setAsOf = (day: string) =>
    update({ asOf: day === today() ? null : day });
  const setBasis = (next: ReportBasis) =>
    update({ basis: next === basisOptions[0] ? null : next });
  const setFilter = (key: string, value: string) =>
    update({ [key]: value || null });
  const clearFilters = () =>
    update(
      Object.fromEntries((entry?.filters ?? []).map((f) => [f.key, null])),
    );

  /**
   * The period part of the URL, for a drill-down into another report: it
   * opens on the same days, as the brief asks.
   */
  const periodSearch = useMemo(() => {
    const out = new URLSearchParams();
    PERIOD_KEYS.forEach((key) => {
      const value = search.get(key);
      if (value) out.set(key, value);
    });
    return out;
  }, [search]);

  return {
    preset,
    range,
    asOf,
    basis,
    filters,
    apiParams,
    periodSearch,
    setRange,
    setAsOf,
    setBasis,
    setFilter,
    clearFilters,
  };
}
