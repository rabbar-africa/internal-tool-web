import type { AdvisoryGroup } from "@/shared/interface/inspection";
import { inspectionColors as c } from "./colors";

/**
 * A band is one urgency section of the report. The four advisory groups map
 * straight across; `passed` covers work that needs nothing — either already
 * done this visit or found sound.
 */
export type BandKey = AdvisoryGroup | "passed";

export interface BandStyle {
  /** Uppercase section title. */
  title: string;
  /** The dash-prefixed qualifier beside it. */
  when: string;
  color: string;
  bg: string;
  /** Glyph in the round badge beside each item's title. */
  icon: string;
}

export const BANDS: Record<BandKey, BandStyle> = {
  fix_now: {
    title: "Fix now",
    when: "— safety critical, do not delay",
    color: c.critical,
    bg: c.criticalBg,
    icon: "!",
  },
  due_soon: {
    title: "Due soon",
    when: "— book within 30 days",
    color: c.soon,
    bg: c.soonBg,
    icon: "•",
  },
  optional: {
    title: "Optional",
    when: "— cosmetic, entirely your call",
    color: c.optional,
    bg: c.optionalBg,
    icon: "◦",
  },
  completed: {
    title: "Passed",
    when: "— sorted during this visit",
    color: c.pass,
    bg: c.passBg,
    icon: "✓",
  },
  passed: {
    title: "Passed",
    when: "— checked and in good order",
    color: c.pass,
    bg: c.passBg,
    icon: "✓",
  },
};

/** Worst first — the order bands are printed in. */
export const BAND_ORDER: BandKey[] = [
  "fix_now",
  "due_soon",
  "optional",
  "completed",
  "passed",
];

/**
 * The verdict bar's three counts. "Passed" folds both green bands together so
 * the tally reads the same whether or not an advisory was drafted.
 */
export const TALLY: { key: BandKey; label: string; counts: BandKey[] }[] = [
  { key: "fix_now", label: "Fix now", counts: ["fix_now"] },
  { key: "due_soon", label: "Due soon", counts: ["due_soon"] },
  { key: "passed", label: "Passed", counts: ["completed", "passed"] },
];

/**
 * Raw finding statuses → bands, for reports saved before an advisory was
 * drafted (the advisory is optional, so the PDF must stand without one).
 * Repaired and replaced parts are sound again, so they land in `passed`.
 */
export const STATUS_TO_BAND: Record<string, BandKey> = {
  good: "passed",
  faulty_repaired: "passed",
  faulty_replaced: "passed",
  needs_attention: "due_soon",
  worn_out: "due_soon",
  needs_repair: "fix_now",
  needs_replacement: "fix_now",
  damaged: "fix_now",
  missing: "fix_now",
  not_genuine: "fix_now",
};

export const REPORT_TITLE = "Vehicle Inspection & Diagnostic Report";

export const SCOPE_HEADING = "What we checked";

export const SCOPE_FOOTNOTE =
  "Ticked items were inspected and found in working order. Not covered: " +
  "internal engine or gearbox condition, and anything requiring dismantling " +
  "beyond a standard inspection.";

export const FINE_PRINT =
  "Valid 30 days from inspection date. Findings reflect the vehicle's " +
  "condition on the inspection date and may change with use. This report is " +
  "not a warranty or guarantee of vehicle condition.";
