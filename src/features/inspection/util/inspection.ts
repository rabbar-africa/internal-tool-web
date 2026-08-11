import type {
  AdvisoryGroup,
  ChecklistItemStatus,
  IInspectionChecklist,
  InspectionStatus,
} from "@/shared/interface/inspection";
import type { ChecklistAnswers } from "../components/generate-inspection/inspection-form.types";

// ─── Checklist ───────────────────────────────────────────────────────────────

export const CHECKLIST_STATUS_META: Record<
  ChecklistItemStatus,
  { label: string; short: string; color: string; bg: string }
> = {
  OK: { label: "OK", short: "OK", color: "green.600", bg: "green.50" },
  NEEDS_FIX: {
    label: "Needs fix",
    short: "Fix",
    color: "red.600",
    bg: "red.50",
  },
  NOT_APPLICABLE: {
    label: "Not checked",
    short: "N/A",
    color: "gray.400",
    bg: "gray.50",
  },
};

/** The order the tri-state control offers, worst-case last. */
export const CHECKLIST_STATUS_ORDER: ChecklistItemStatus[] = [
  "OK",
  "NEEDS_FIX",
  "NOT_APPLICABLE",
];

/**
 * Turns the saved checklist rows into the form's keyed answers. Every catalog
 * item is stored on the inspection, so this covers the whole catalog.
 */
export function answersFromChecklists(
  checklists: IInspectionChecklist[] = [],
): ChecklistAnswers {
  return checklists.reduce<ChecklistAnswers>((acc, entry) => {
    acc[entry.checklistItemId] = {
      status: entry.status,
      notes: entry.notes ?? "",
    };
    return acc;
  }, {});
}

/**
 * Only answered items are sent — the backend fills the rest of the catalog with
 * NOT_APPLICABLE, so posting them back would just be noise.
 */
export function answersToEntries(answers: ChecklistAnswers) {
  return Object.entries(answers)
    .filter(([, answer]) => answer.status !== "NOT_APPLICABLE" || answer.notes)
    .map(([checklistItemId, answer]) => ({
      checklistItemId,
      status: answer.status,
      ...(answer.notes ? { notes: answer.notes } : {}),
    }));
}

export interface ChecklistProgress {
  answered: number;
  total: number;
  needsFix: number;
  /** Required items still unanswered — these block completion. */
  requiredOutstanding: string[];
}

/** What the form needs to tell the technician how far along they are. */
export function checklistProgress(
  items: { id: string; name: string; isRequired: boolean }[],
  answers: ChecklistAnswers,
): ChecklistProgress {
  let answered = 0;
  let needsFix = 0;
  const requiredOutstanding: string[] = [];

  items.forEach((item) => {
    const status = answers[item.id]?.status ?? "NOT_APPLICABLE";
    if (status !== "NOT_APPLICABLE") answered += 1;
    if (status === "NEEDS_FIX") needsFix += 1;
    if (item.isRequired && status === "NOT_APPLICABLE") {
      requiredOutstanding.push(item.name);
    }
  });

  return { answered, total: items.length, needsFix, requiredOutstanding };
}

// ─── Advisory ────────────────────────────────────────────────────────────────

export const ADVISORY_GROUP_META: Record<
  AdvisoryGroup,
  { label: string; hint: string; color: string; bg: string; border: string }
> = {
  fix_now: {
    label: "Fix now",
    hint: "Safety-critical — do not delay",
    color: "red.600",
    bg: "red.50",
    border: "red.100",
  },
  due_soon: {
    label: "Due soon",
    hint: "Book within about 30 days",
    color: "orange.600",
    bg: "orange.50",
    border: "orange.100",
  },
  optional: {
    label: "Optional",
    hint: "Cosmetic or comfort only",
    color: "blue.600",
    bg: "blue.50",
    border: "blue.100",
  },
  completed: {
    label: "Completed",
    hint: "Done during this visit",
    color: "green.600",
    bg: "green.50",
    border: "green.100",
  },
};

export const ADVISORY_GROUP_OPTIONS = (
  Object.keys(ADVISORY_GROUP_META) as AdvisoryGroup[]
).map((value) => ({ label: ADVISORY_GROUP_META[value].label, value }));

/** "Do not drive" reads better than "0 days left". */
export function formatDeadline(days?: number): string {
  if (days === undefined || days === null) return "";
  if (days <= 0) return "Do not drive until fixed";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

// ─── Inspection status ───────────────────────────────────────────────────────

export const INSPECTION_STATUS_META: Record<
  InspectionStatus,
  { label: string; color: string; bg: string }
> = {
  IN_PROGRESS: {
    label: "In progress",
    color: "orange.600",
    bg: "orange.50",
  },
  COMPLETED: { label: "Completed", color: "green.600", bg: "green.50" },
};
