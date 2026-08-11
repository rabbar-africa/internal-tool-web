import type {
  ChecklistEntryPayload,
  ChecklistItemStatus,
  IAdvisory,
} from "@/shared/interface/inspection";

export interface Finding {
  component: string;
  observation: string;
  status: string;
  /** Up to 2 photo URLs. */
  images?: string[];
}

/** A catalog item's answer while the form is open, keyed by checklistItemId. */
export type ChecklistAnswers = Record<
  string,
  { status: ChecklistItemStatus; notes: string }
>;

export interface InspectionFormValues {
  // Selection state
  clientId: string;
  vehicleId: string;
  technicianName: string;
  // Auto-filled from the selected customer / vehicle — never entered by hand.
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleColor: string;
  findings: Finding[];
  additionalNotes: string;
  inspectionDate: string;
  /** Answers to the org's checklist catalog. Absent items mean NOT_APPLICABLE. */
  checklistAnswers: ChecklistAnswers;
  /** AI-drafted then technician-edited. Null until one is drafted or loaded. */
  advisory: IAdvisory | null;
}

/**
 * Create/update payload, mirroring the backend Create/UpdateInspectionDto.
 * `vehicleId` and `customerName` are required; the rest are optional. Findings
 * are free-text; `checklistEntries` answers the org's catalog alongside them.
 */
export interface InspectionPayload {
  vehicleId: string;
  technicianName?: string;
  customerName: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  generalNotes?: string;
  inspectionDate: string;
  findings: Finding[];
  checklistEntries?: ChecklistEntryPayload[];
  advisory?: IAdvisory;
}

export const TITLE_OPTIONS = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Miss", value: "Miss" },
  { label: "Dr", value: "Dr" },
  { label: "Chief", value: "Chief" },
];

export const FINDING_STATUSES = [
  "good",
  "needs_attention",
  "worn_out",
  "needs_repair",
  "needs_replacement",
  "faulty_repaired",
  "faulty_replaced",
  "damaged",
  "missing",
  "not_genuine",
] as const;

export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const STATUS_OPTIONS: { label: string; value: FindingStatus }[] = [
  { label: "Good", value: "good" },
  { label: "Needs Attention", value: "needs_attention" },
  { label: "Worn Out", value: "worn_out" },
  { label: "Needs Repair", value: "needs_repair" },
  { label: "Needs Replacement", value: "needs_replacement" },
  { label: "Faulty - Repaired", value: "faulty_repaired" },
  { label: "Faulty - Replaced", value: "faulty_replaced" },
  { label: "Damaged", value: "damaged" },
  { label: "Missing", value: "missing" },
  { label: "Not Genuine (Non-OEM)", value: "not_genuine" },
];
