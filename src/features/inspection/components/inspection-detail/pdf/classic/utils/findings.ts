import type { IInspectionFinding } from "@/shared/interface/inspection";
import { FINDING_GROUPS, STATUS_BUCKET, type Bucket } from "../constants";

export const normalizeStatus = (s?: string): Bucket =>
  STATUS_BUCKET[s?.toLowerCase?.() ?? ""] ?? "warning";

export interface FindingGroup {
  bucket: Bucket;
  label: string;
  count: number;
  /** The count's noun, already pluralised — "items", "check". */
  unit: string;
  /** Findings two per row, so a pair shares a height and never splits. */
  rows: IInspectionFinding[][];
}

function inPairs(items: IInspectionFinding[]): IInspectionFinding[][] {
  const rows: IInspectionFinding[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

/**
 * Sorts findings into severity bands, worst first — recorded order buries the
 * urgent ones among the passes. Empty bands are kept so the summary tiles and
 * the grouped list read off one set of counts; the list drops them itself.
 */
export function groupFindings(
  findings: IInspectionFinding[] = [],
): FindingGroup[] {
  return FINDING_GROUPS.map(({ bucket, label, unit }) => {
    const items = findings.filter((f) => normalizeStatus(f.status) === bucket);
    return {
      bucket,
      label,
      count: items.length,
      unit: items.length === 1 ? unit : `${unit}s`,
      rows: inPairs(items),
    };
  });
}
