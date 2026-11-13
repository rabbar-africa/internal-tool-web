import type {
  CreditNoteStatus,
  ICreditNote,
} from "@/shared/interface/credit-note";
import { CREDIT_NOTE_REASON_LABELS } from "@/shared/interface/credit-note";

export const CREDIT_NOTE_STATUS_LABELS: Record<CreditNoteStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
  VOID: "Void",
};

export const CREDIT_NOTE_STATUS_OPTIONS: {
  label: string;
  value: CreditNoteStatus | "";
}[] = [
  { label: "All", value: "" },
  ...(Object.keys(CREDIT_NOTE_STATUS_LABELS) as CreditNoteStatus[]).map(
    (value) => ({ label: CREDIT_NOTE_STATUS_LABELS[value], value }),
  ),
];

export const CREDIT_NOTE_REASON_OPTIONS = (
  Object.keys(
    CREDIT_NOTE_REASON_LABELS,
  ) as (keyof typeof CREDIT_NOTE_REASON_LABELS)[]
).map((value) => ({ label: CREDIT_NOTE_REASON_LABELS[value], value }));

export const reasonLabel = (reason?: string | null) =>
  (reason &&
    CREDIT_NOTE_REASON_LABELS[
      reason as keyof typeof CREDIT_NOTE_REASON_LABELS
    ]) ||
  "Other";

/** Whether anything has been taken from the note yet. */
export const isCreditUsed = (
  note: Pick<ICreditNote, "amountApplied" | "amountRefunded">,
) => Number(note.amountApplied) > 0 || Number(note.amountRefunded) > 0;

export interface CreditNoteActions {
  edit: boolean;
  issue: boolean;
  apply: boolean;
  refund: boolean;
  void: boolean;
  delete: boolean;
}

/**
 * What the note's status allows, before permissions (the API's rules, from
 * docs/frontend-credit-notes.md §1). Callers also check the user's role.
 */
export function creditNoteActions(
  note: Pick<
    ICreditNote,
    "status" | "balance" | "amountApplied" | "amountRefunded"
  >,
): CreditNoteActions {
  const hasCredit = Number(note.balance) > 0;
  switch (note.status) {
    case "DRAFT":
      return {
        edit: true,
        issue: true,
        apply: false,
        refund: false,
        void: true,
        delete: true,
      };
    case "OPEN":
      return {
        edit: true,
        issue: false,
        apply: hasCredit,
        refund: hasCredit,
        // A note that's been used must give that back first.
        void: !isCreditUsed(note),
        delete: false,
      };
    default:
      return {
        edit: false,
        issue: false,
        apply: false,
        refund: false,
        void: false,
        delete: false,
      };
  }
}

/** Invoices a credit note can be made from: issued, and still standing. */
export const isCreditableInvoiceStatus = (status?: string | null) =>
  !!status &&
  !["DRAFT", "VOID", "WRITTEN_OFF", "DELETED"].includes(status.toUpperCase());
