import type {
  IAdvisory,
  IInspectionFinding,
} from "@/shared/interface/inspection";
import { BAND_ORDER, STATUS_TO_BAND, type BandKey } from "../constants";

/** One item inside a band, whether it came from the advisory or a raw finding. */
export interface BandItem {
  title: string;
  observation?: string;
  /** "If left: …" — the consequence of ignoring it. */
  danger?: string;
  /** Days before this must be handled. 0 = do not drive. */
  daysLeft?: number;
  /** Raw components this covers; advisory entries may merge several. */
  components: string[];
  images: string[];
}

export interface Band {
  key: BandKey;
  items: BandItem[];
}

/** Photos live on the raw findings, so advisory items borrow them by name. */
function imagesFor(
  components: string[],
  findings: IInspectionFinding[],
): string[] {
  const wanted = new Set(components.map((name) => name.toLowerCase()));
  return findings
    .filter((finding) => wanted.has(finding.component?.toLowerCase()))
    .flatMap((finding) => finding.images ?? [])
    .slice(0, 2);
}

/**
 * The report is organised by urgency. An advisory supplies that directly; when
 * one was never drafted the bands are derived from the raw finding statuses so
 * the report still reads the same way.
 */
export function buildBands(
  advisory: IAdvisory | null | undefined,
  findings: IInspectionFinding[] = [],
): Band[] {
  const grouped = new Map<BandKey, BandItem[]>();
  const push = (key: BandKey, item: BandItem) => {
    const existing = grouped.get(key);
    if (existing) existing.push(item);
    else grouped.set(key, [item]);
  };

  if (advisory?.findings?.length) {
    advisory.findings.forEach((entry) => {
      push(entry.group, {
        title: entry.title,
        observation: entry.observation,
        danger: entry.danger,
        daysLeft: entry.maxDurationLeft,
        components: entry.components ?? [],
        images: imagesFor(entry.components ?? [], findings),
      });
    });
  } else {
    findings.forEach((finding) => {
      const key = STATUS_TO_BAND[finding.status?.toLowerCase()] ?? "due_soon";
      push(key, {
        title: finding.component,
        observation: finding.observation,
        components: [],
        images: (finding.images ?? []).slice(0, 2),
      });
    });
  }

  return BAND_ORDER.filter((key) => grouped.get(key)?.length).map((key) => ({
    key,
    items: grouped.get(key) ?? [],
  }));
}

export function countIn(bands: Band[], key: BandKey): number {
  return bands.find((band) => band.key === key)?.items.length ?? 0;
}

/** "2 items" / "1 item" — the count that sits at the end of a band header. */
export const itemCount = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/**
 * The right-hand column of a finding row. Cost estimates aren't part of the
 * inspection model, so the column carries the one deadline fact we do hold.
 */
export function timingFor(
  key: BandKey,
  daysLeft?: number,
): { label: string; value: string; sub?: string } | null {
  if (key === "completed") {
    return { label: "Status", value: "Done", sub: "This visit" };
  }
  if (key === "passed") return null;

  if (daysLeft === undefined || daysLeft === null) {
    if (key === "fix_now") {
      return { label: "Timing", value: "Now", sub: "Before driving" };
    }
    if (key === "due_soon") {
      return { label: "Timing", value: "30 days", sub: "Book it in" };
    }
    return { label: "Timing", value: "Optional", sub: "No deadline" };
  }

  if (daysLeft <= 0) {
    return { label: "Timing", value: "Now", sub: "Do not drive" };
  }
  return {
    label: "Timing",
    value: `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`,
    sub: "From inspection",
  };
}
