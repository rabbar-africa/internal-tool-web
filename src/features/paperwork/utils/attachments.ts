import type { IPaperworkFile } from "@/shared/interface/paperwork";

/**
 * A scan sitting in a paperwork form. Files picked in the browser stay local
 * until the form is submitted — uploading on every pick would litter storage
 * with scans the user removes again before saving.
 */
export type PaperworkAttachment =
  | { kind: "stored"; file: IPaperworkFile }
  | { kind: "pending"; localId: string; file: File };

// Matches the backend's allowed MIME types and size ceiling.
export const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.gif";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

let localIdCounter = 0;

export const storedAttachment = (
  file: IPaperworkFile,
): PaperworkAttachment => ({
  kind: "stored",
  file,
});

export const pendingAttachment = (file: File): PaperworkAttachment => ({
  kind: "pending",
  localId: `pending-${++localIdCounter}`,
  file,
});

export const isPending = (
  a: PaperworkAttachment,
): a is Extract<PaperworkAttachment, { kind: "pending" }> =>
  a.kind === "pending";

export const isStored = (
  a: PaperworkAttachment,
): a is Extract<PaperworkAttachment, { kind: "stored" }> => a.kind === "stored";

/** Stable React key — server id for saved scans, local id for pending ones. */
export const attachmentKey = (a: PaperworkAttachment): string =>
  isStored(a) ? a.file.id : a.localId;

export const attachmentName = (a: PaperworkAttachment): string =>
  (isStored(a) ? a.file.fileName : a.file.name) || "Document";

export const attachmentSize = (a: PaperworkAttachment): number | null =>
  isStored(a) ? (a.file.fileSize ?? null) : a.file.size;

/** Only saved scans are viewable — pending ones have no URL yet. */
export const attachmentUrl = (a: PaperworkAttachment): string | null =>
  isStored(a) ? a.file.fileUrl : null;
