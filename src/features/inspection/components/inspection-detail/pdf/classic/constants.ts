import { inspectionColors as c } from "./colors";

/** The three severity buckets every finding status collapses into. */
export type Bucket = "pass" | "warning" | "fail";

/** Per-status icon color, card fill and border — from the source template. */
export const STATUS_CONFIG: Record<
  Bucket,
  { bg: string; border: string; text: string }
> = {
  pass: { bg: c.passBg, border: c.passBorder, text: c.passText },
  warning: { bg: c.warnBg, border: c.warnBorder, text: c.warnText },
  fail: { bg: c.failBg, border: c.failBorder, text: c.failText },
};

/** Maps the free-text finding statuses onto the buckets. */
export const STATUS_BUCKET: Record<string, Bucket> = {
  good: "pass",
  faulty_repaired: "pass",
  faulty_replaced: "pass",
  needs_attention: "warning",
  worn_out: "warning",
  needs_repair: "fail",
  needs_replacement: "fail",
  damaged: "fail",
  missing: "fail",
  not_genuine: "fail",
};

/**
 * The severity bands, worst first — the order the summary tiles and the grouped
 * findings both read in. `unit` is the singular noun; the count pluralises it.
 */
export const FINDING_GROUPS: {
  bucket: Bucket;
  label: string;
  unit: string;
}[] = [
  { bucket: "fail", label: "Immediate Attention", unit: "item" },
  { bucket: "warning", label: "Monitor", unit: "item" },
  { bucket: "pass", label: "Passed", unit: "check" },
];

export const REPORT_SUBTITLE = "Full Vehicle Inspection & Diagnostic Report";

export const CHECKS_SUBTITLE = "Comprehensive vehicle system inspection";

export const REPORT_DISCLAIMER =
  "This inspection report is valid for 30 days from the date of inspection. " +
  "Recommendations are based on observations at the time of inspection. " +
  "Vehicle condition may change based on usage and time. This report does not " +
  "constitute a warranty or guarantee of vehicle condition.";
