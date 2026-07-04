// Paperwork — a flexible document-expiry tracker for client/vehicle paperwork
// (road worthiness, insurance, vehicle registration, or any custom document).
// The backend derives status/daysUntilExpiry, so the frontend never does date math.

export type PaperworkStatus =
  | "VALID"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "NO_EXPIRY";

/** Owner reference attached to some paperwork reads (e.g. the expiring panel). */
export interface PaperworkClientRef {
  id: string;
  displayName?: string;
  phone?: string | null;
  email?: string | null;
}

/** Optional vehicle reference attached to some paperwork reads. */
export interface PaperworkVehicleRef {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  registrationNumber?: string | null;
}

/** A superseded version, snapshotted when a document is renewed. */
export interface IPaperworkRenewal {
  id: string;
  paperworkId: string;
  documentType?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuer?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface IPaperwork {
  id: string;
  clientId: string;
  vehicleId?: string | null;
  /** Free-form: ROAD_WORTHINESS, INSURANCE, VEHICLE_REGISTRATION, or anything custom. */
  documentType: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuer?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;

  // Digital copy (optional)
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;

  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Derived on every read — no date math needed on the frontend.
  status: PaperworkStatus;
  daysUntilExpiry: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;

  // Relations, attached on some reads.
  client?: PaperworkClientRef | null;
  vehicle?: PaperworkVehicleRef | null;
  renewals?: IPaperworkRenewal[];
}

export interface CreatePaperworkPayload {
  clientId: string;
  vehicleId?: string;
  documentType: string;
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  referenceNumber?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export type UpdatePaperworkPayload = Partial<CreatePaperworkPayload>;

/** Renew snapshots the current version to history, then applies these new fields. */
export interface RenewPaperworkPayload {
  expiryDate?: string;
  issueDate?: string;
  referenceNumber?: string;
  issuer?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}
