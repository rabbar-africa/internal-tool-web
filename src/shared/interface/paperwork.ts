// Paperwork — a flexible document-expiry tracker for client/vehicle paperwork
// (road worthiness, insurance, full paperwork bundles, or any custom document).
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

/** A scan to attach — the shape POST /files/upload returns. */
export interface PaperworkFileInput {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

/** A scan already stored against a paperwork record. */
export interface IPaperworkFile {
  id: string;
  paperworkId?: string;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt?: string;
}

/**
 * A superseded version, snapshotted when a document is renewed. Its files are a
 * JSON snapshot rather than rows, so they carry no id. The singular `file*`
 * fields belong to renewals recorded before multi-file support.
 */
export interface IPaperworkRenewal {
  id: string;
  paperworkId: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  files?: PaperworkFileInput[] | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  renewedAt: string;
}

export interface IPaperwork {
  id: string;
  clientId: string;
  vehicleId?: string | null;
  /** Free-form: ROAD_WORTHINESS, INSURANCE, FULL_PAPERWORK, or anything custom. */
  documentType: string;
  title?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuer?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;

  /** Digital copies — a document can carry several scans. */
  files?: IPaperworkFile[];

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
  title?: string;
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  referenceNumber?: string;
  notes?: string;
  files?: PaperworkFileInput[];
}

/**
 * The update endpoint rejects any field it doesn't declare, so this mirrors
 * UpdatePaperworkDto exactly: the owner is fixed after creation, and
 * attachments are managed through the add/remove file endpoints.
 *
 * Note: empty strings clear text fields, but `issueDate`, `expiryDate` and
 * `vehicleId` are validated as date/uuid and so cannot be blanked — omit them
 * to leave them untouched.
 */
export interface UpdatePaperworkPayload {
  vehicleId?: string;
  documentType?: string;
  title?: string;
  issuer?: string;
  referenceNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

/**
 * Renew snapshots the current version to history, then applies these fields.
 * The supplied files become the renewed document's live files — anything not
 * re-uploaded stays only in the snapshot. `issuer` is not renewable.
 */
export interface RenewPaperworkPayload {
  expiryDate: string;
  issueDate?: string;
  referenceNumber?: string;
  notes?: string;
  files?: PaperworkFileInput[];
}
