import type { IVehicle } from "./common";

export interface IInspectionVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: string;
}

export interface IInspectionClient {
  id: string;
  displayName: string;
}

// ─── Findings ────────────────────────────────────────────────────────────────

/** The raw statuses a technician picks from. */
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

export interface IInspectionFinding {
  component: string;
  status: string;
  observation?: string;
  /** Up to 2 photo URLs attached by the technician for this finding. */
  images?: string[];
}

// ─── Checklist ───────────────────────────────────────────────────────────────

export type ChecklistItemStatus = "OK" | "NEEDS_FIX" | "NOT_APPLICABLE";

/** A catalog entry — the org's checklist, shared across all inspections. */
export interface IChecklistItem {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  /** Required items must be inspected before an inspection can be completed. */
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The catalog keyed by category, as returned by `GET /checklists/grouped`. */
export type GroupedChecklistItems = Record<string, IChecklistItem[]>;

/** One catalog entry as answered on a specific inspection. */
export interface IInspectionChecklist {
  id: string;
  inspectionReportId: string;
  checklistItemId: string;
  status: ChecklistItemStatus;
  notes?: string | null;
  checklistItem: IChecklistItem;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistEntryPayload {
  checklistItemId: string;
  status: ChecklistItemStatus;
  notes?: string;
}

export interface CreateChecklistItemPayload {
  name: string;
  category: string;
  isRequired?: boolean;
}

export interface ChecklistFilter {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// ─── Advisory ────────────────────────────────────────────────────────────────

/** Urgency bands an advisory finding falls into. */
export const ADVISORY_GROUPS = [
  "fix_now",
  "due_soon",
  "optional",
  "completed",
] as const;

export type AdvisoryGroup = (typeof ADVISORY_GROUPS)[number];

export interface IAdvisoryVerdict {
  /** One blunt line on the overall state of the vehicle. */
  headline: string;
  /** 1–2 sentences: what must happen now vs. what can wait. */
  summary: string;
}

export interface IAdvisoryFinding {
  /** Short customer-facing title, e.g. "Brake pads — front and rear". */
  title: string;
  /** The raw finding component(s) this entry covers; related ones get merged. */
  components: string[];
  group: AdvisoryGroup;
  observation: string;
  /** What happens if ignored. Omitted for already-completed work. */
  danger?: string;
  /** Days before this must be handled. 0 = do not drive until fixed. */
  maxDurationLeft?: number;
}

/**
 * AI-drafted via `POST /inspections/ai/advisory`, then reviewed and edited by
 * the technician before being saved with the inspection. The AI never writes
 * it directly — it only ever arrives as part of a create/update payload.
 */
export interface IAdvisory {
  verdict: IAdvisoryVerdict;
  findings: IAdvisoryFinding[];
}

export type AiTone = "professional" | "friendly" | "technical";

export interface DraftAdvisoryPayload {
  findings: IInspectionFinding[];
  vehicleInfo?: {
    name?: string;
    number?: string;
    year?: number;
    color?: string;
    mileage?: number;
  };
  customerName?: string;
  technicianName?: string;
  inspectionDate?: string;
  tone?: AiTone;
}

/**
 * The older AI summary, which writes `generalNotes` as HTML. The advisory
 * superseded it, but the classic PDF still renders those notes, so both remain.
 */
export interface SummarizeNotesPayload extends DraftAdvisoryPayload {
  /** Append a prioritised action plan. Defaults to true server-side. */
  includeActionPlan?: boolean;
  /** Label items Immediate / Soon / Routine. Defaults to true server-side. */
  includeUrgency?: boolean;
}

// ─── Inspection ──────────────────────────────────────────────────────────────

export type InspectionStatus = "IN_PROGRESS" | "COMPLETED";

export interface IInspection {
  id: string;
  organizationId: string;
  vehicleId: string;
  customerId?: string | null;
  jobCardId?: string | null;
  jobCode: string;
  technicianName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: InspectionStatus;
  generalNotes: string;
  photos: string[];
  pdfUrl: string | null;
  inspectionDate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleRegistrationNumber: string;
  vehicleVin: string;
  vehicleColor: string;
  findings: IInspectionFinding[];
  advisory?: IAdvisory | null;
  /** Every catalog item, defaulted to NOT_APPLICABLE when never answered. */
  inspectionChecklists?: IInspectionChecklist[];

  createdAt: string;
  updatedAt: string;
  vehicle: IVehicle | null;
}

export interface InspectionFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vehicleId?: string;
  technicianName?: string;
  dateFrom?: string;
  dateTo?: string;
}
