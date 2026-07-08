import type { IBaseFilter } from "./filter";
import type { Expense } from "./expense";
import type { Technician } from "./technician";

export type JobCardStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "AWAITING_APPROVAL"
  | "AWAITING_PARTS"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";

export type JobCardPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface JobCardTechnician {
  id: string;
  jobCardId: string;
  technicianId: string;
  isLead: boolean;
  createdAt: string;
  technician: Technician;
}

export interface JobCardFile {
  id: string;
  jobCardId: string;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
}

/** Summary row returned by GET /job-cards. */
export interface JobCard {
  id: string;
  organizationId: string;
  jobNumber: string;
  clientId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  vehicleId: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleRegistrationNumber: string | null;
  status: JobCardStatus;
  priority: JobCardPriority;
  complaint: string | null;
  diagnosisNotes: string | null;
  notes: string | null;
  odometerIn: number | null;
  odometerOut: number | null;
  promisedDate: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  technicians: JobCardTechnician[];
  _count: {
    inspections: number;
    invoices: number;
    expenses: number;
    files: number;
  };
}

export interface JobCardFinancials {
  invoicedTotal: number;
  collected: number;
  outstanding: number;
  expensesTotal: number;
  profit: number;
}

export interface JobCardInspection {
  id: string;
  jobCode: string;
  status: string;
  inspectionDate: string;
  createdAt: string;
}

/** Lightweight slices of the expanded relations on the detail endpoint —
 * only the fields the job card screens render. */
export interface JobCardInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  status: string;
  total: string;
  balance: string;
}

export interface JobCardPayment {
  id: string;
  paymentNumber: string;
  customerName: string;
  date: string;
  mode: string;
  status: string;
  amount: string;
}

export interface JobCardVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vin?: string | null;
  color?: string | null;
}

export interface JobCardClient {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string | null;
  email: string | null;
}

export interface JobCardDetail extends JobCard {
  client: JobCardClient | null;
  vehicle: JobCardVehicle | null;
  files: JobCardFile[];
  inspections: JobCardInspection[];
  invoices: JobCardInvoice[];
  payments: JobCardPayment[];
  expenses: Expense[];
  financials: JobCardFinancials;
}

export interface CreateJobCardPayload {
  clientId?: string | null;
  customerName?: string;
  customerPhone?: string;
  vehicleId?: string | null;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleRegistrationNumber?: string;
  status?: JobCardStatus;
  priority?: JobCardPriority;
  complaint?: string;
  diagnosisNotes?: string;
  notes?: string;
  odometerIn?: number;
  odometerOut?: number;
  openedAt?: string;
  promisedDate?: string;
  technicianIds?: string[];
  jobNumber?: string;
}

/** PUT accepts everything except technicianIds (managed via dedicated endpoints). */
export type UpdateJobCardPayload = Omit<
  CreateJobCardPayload,
  "technicianIds"
> & {
  /** Close/delivery time — set when the job card is in a closing status. */
  closedAt?: string;
};

/** Output of the job card form — create fields plus closedAt (edit-only). */
export type JobCardFormPayload = CreateJobCardPayload & { closedAt?: string };

export interface AssignTechnicianPayload {
  technicianId: string;
  isLead?: boolean;
}

export interface AttachJobCardFilePayload {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  notes?: string;
}

export interface IGetJobCardFilter extends IBaseFilter {
  status?: string;
  clientId?: string;
  vehicleId?: string;
  technicianId?: string;
}

export const JOB_CARD_STATUS_LABELS: Record<JobCardStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  AWAITING_APPROVAL: "Awaiting Approval",
  AWAITING_PARTS: "Awaiting Parts",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const JOB_CARD_STATUS_OPTIONS = (
  Object.keys(JOB_CARD_STATUS_LABELS) as JobCardStatus[]
).map((value) => ({ label: JOB_CARD_STATUS_LABELS[value], value }));

export const JOB_CARD_STATUS_STYLES: Record<
  JobCardStatus,
  { bg: string; color: string }
> = {
  OPEN: { bg: "blue.50", color: "blue.600" },
  IN_PROGRESS: { bg: "orange.50", color: "orange.600" },
  AWAITING_APPROVAL: { bg: "purple.50", color: "purple.600" },
  AWAITING_PARTS: { bg: "yellow.50", color: "yellow.700" },
  COMPLETED: { bg: "green.50", color: "green.600" },
  DELIVERED: { bg: "teal.50", color: "teal.600" },
  CANCELLED: { bg: "red.50", color: "red.600" },
};

export const JOB_CARD_PRIORITY_LABELS: Record<JobCardPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const JOB_CARD_PRIORITY_OPTIONS = (
  Object.keys(JOB_CARD_PRIORITY_LABELS) as JobCardPriority[]
).map((value) => ({ label: JOB_CARD_PRIORITY_LABELS[value], value }));

export const JOB_CARD_PRIORITY_STYLES: Record<
  JobCardPriority,
  { bg: string; color: string }
> = {
  LOW: { bg: "gray.100", color: "gray.600" },
  NORMAL: { bg: "blue.50", color: "blue.600" },
  HIGH: { bg: "orange.50", color: "orange.600" },
  URGENT: { bg: "red.50", color: "red.600" },
};

/** "Toyota Corolla (2018)" from make/model/year — no registration number. */
export const jobCardVehicleShortLabel = (
  jobCard: Pick<JobCard, "vehicleMake" | "vehicleModel" | "vehicleYear">,
): string => {
  const name = [jobCard.vehicleMake, jobCard.vehicleModel]
    .filter(Boolean)
    .join(" ");
  return jobCard.vehicleYear ? `${name} (${jobCard.vehicleYear})` : name;
};

/** "Toyota Corolla (2018) • ABC 123 XY" from whichever vehicle fields are set. */
export const jobCardVehicleLabel = (
  jobCard: Pick<
    JobCard,
    "vehicleMake" | "vehicleModel" | "vehicleYear" | "vehicleRegistrationNumber"
  >,
): string => {
  return [jobCardVehicleShortLabel(jobCard)].filter(Boolean).join(" • ");
};
