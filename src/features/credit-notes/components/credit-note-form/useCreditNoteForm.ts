import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { getErrorMessage } from "@/utils/handle-error";
import { useGetOrganizationTransactionSeries } from "@/features/settings/api/query";
import type {
  CreditNoteDraftLine,
  CreditNoteReason,
  ICreditNote,
  PreviewCreditNotePayload,
} from "@/shared/interface/credit-note";
import {
  useCreateCreditNoteMutation,
  useCreditNotePreviewQuery,
  useGetCreditNoteDraftQuery,
  useUpdateCreditNoteMutation,
} from "../../api/query";

/** One invoice line on the form: whether it's credited, and how much. */
export interface CreditLineRow {
  ticked: boolean;
  /** Text while typing; numbers only on the way out. */
  quantity: string;
  rate: string;
}

export interface CreditNoteFormFields {
  date: string;
  reason: CreditNoteReason | "";
  reasonNote: string;
  notes: string;
  referenceNumber: string;
  templateId: string;
  creditNoteNumber: string;
  shippingCharge: string;
  adjustment: string;
  /** Create only: apply the credit to its invoice straight away. */
  applyToInvoice: boolean;
}

const today = () => moment().format("YYYY-MM-DD");
const day = (value?: string | null) =>
  value ? moment(value).format("YYYY-MM-DD") : "";
const toNumber = (value: string) =>
  value.trim() === "" ? Number.NaN : Number(value);

/** Plain decimals, without float noise: 0.1 + 0.2 shows as 0.3. */
const trim = (value: number) => String(Math.round(value * 1000) / 1000);

/** What the row allows, given what's left to credit on the invoice line. */
export function rowError(
  line: CreditNoteDraftLine,
  row: CreditLineRow | undefined,
): string | null {
  if (!row?.ticked) return null;
  const quantity = toNumber(row.quantity);
  const rate = toNumber(row.rate);
  if (!(quantity > 0)) return "Enter a quantity above 0";
  if (quantity > line.creditableQuantity) {
    return `At most ${trim(line.creditableQuantity)} left to credit`;
  }
  if (!(rate > 0)) return "Enter a rate above 0";
  if (rate > line.rate) return "Can't be more than the invoice's rate";
  return null;
}

interface Options {
  invoiceId: string | null;
  /** Editing: the saved note. Its own lines are offered again. */
  note?: ICreditNote;
}

export function useCreditNoteForm({ invoiceId, note }: Options) {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const isEdit = Boolean(note);

  const draftQuery = useGetCreditNoteDraftQuery(invoiceId, note?.id);
  const draft = draftQuery.data?.data;

  const { data: seriesData } = useGetOrganizationTransactionSeries();
  const isAutoNumber =
    (seriesData?.data ?? []).find((s) => s.module === "CREDIT_NOTE")
      ?.autoGenerate ?? true;

  const [rows, setRows] = useState<Record<string, CreditLineRow>>({});
  const [fields, setFields] = useState<CreditNoteFormFields>(() => ({
    date: day(note?.date) || today(),
    reason: note?.reason ?? "",
    reasonNote: note?.reasonNote ?? "",
    notes: note?.notes ?? "",
    referenceNumber: note?.referenceNumber ?? "",
    templateId: note?.templateId ?? "",
    creditNoteNumber: "",
    shippingCharge: note ? trim(Number(note.shippingCharge)) : "0",
    adjustment: note ? trim(Number(note.adjustment)) : "0",
    applyToInvoice: true,
  }));
  const [submitted, setSubmitted] = useState(false);

  // Fill the lines once the invoice's draft arrives (again if the invoice
  // changes). Editing ticks the note's own lines at their saved amounts.
  const draftKey = draft?.invoice.id;
  useEffect(() => {
    if (!draft) return;
    const saved = new Map(
      (note?.lineItems ?? []).map((li) => [li.invoiceLineItemId, li]),
    );
    setRows(
      Object.fromEntries(
        draft.lines.map((line) => {
          const own = saved.get(line.invoiceLineItemId);
          return [
            line.invoiceLineItemId,
            {
              ticked: Boolean(own),
              quantity: trim(
                own ? Number(own.quantity) : line.creditableQuantity,
              ),
              rate: trim(own ? Number(own.rate) : line.rate),
            },
          ];
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const setRow = (id: string, patch: Partial<CreditLineRow>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const setField = <K extends keyof CreditNoteFormFields>(
    key: K,
    value: CreditNoteFormFields[K],
  ) => setFields((prev) => ({ ...prev, [key]: value }));

  const lines = draft?.lines ?? [];
  const lineErrors = Object.fromEntries(
    lines.map((line) => [
      line.invoiceLineItemId,
      rowError(line, rows[line.invoiceLineItemId]),
    ]),
  );
  const tickedLines = lines.filter(
    (line) => rows[line.invoiceLineItemId]?.ticked,
  );

  // Shipping and adjustment are offered only while some is left to credit (or
  // the note being edited already credits some).
  const showShipping =
    Boolean(draft?.shippingCharge) || Number(note?.shippingCharge ?? 0) !== 0;
  const showAdjustment =
    Boolean(draft?.adjustment) || Number(note?.adjustment ?? 0) !== 0;
  const shipping = showShipping ? toNumber(fields.shippingCharge) || 0 : 0;
  const adjustment = showAdjustment ? toNumber(fields.adjustment) || 0 : 0;

  const linesValid = tickedLines.every(
    (line) => !lineErrors[line.invoiceLineItemId],
  );
  const hasSomething =
    tickedLines.length > 0 || shipping !== 0 || adjustment !== 0;

  /** The request, as preview, create and edit take it. */
  const payload = useMemo<PreviewCreditNotePayload | null>(() => {
    if (!invoiceId) return null;
    return {
      invoiceId,
      ...(note ? { creditNoteId: note.id } : {}),
      lines: tickedLines.map((line) => {
        const row = rows[line.invoiceLineItemId];
        const rate = toNumber(row.rate);
        return {
          invoiceLineItemId: line.invoiceLineItemId,
          quantity: toNumber(row.quantity),
          // Only sent when lowered: the invoice's rate is the default.
          ...(rate !== line.rate ? { rate } : {}),
        };
      }),
      ...(showShipping ? { shippingCharge: shipping } : {}),
      ...(showAdjustment ? { adjustment } : {}),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    invoiceId,
    note?.id,
    rows,
    shipping,
    adjustment,
    showShipping,
    showAdjustment,
    draftKey,
  ]);

  // Totals come from the API, never worked out here: it applies the invoice's
  // own discount and VAT, and the note that finishes an invoice takes what's
  // left to the kobo.
  const debounced = useDebounce(payload, 400);
  const canPreview =
    Boolean(debounced) && linesValid && hasSomething && !draft?.refusal;
  const previewQuery = useCreditNotePreviewQuery(canPreview ? debounced : null);
  const preview = canPreview ? previewQuery.data?.data : undefined;
  const previewError =
    canPreview && previewQuery.isError
      ? getErrorMessage(previewQuery.error)
      : null;

  const dateError =
    draft && fields.date && day(draft.invoice.date) > fields.date
      ? "Can't be before the invoice's date"
      : null;
  const numberError =
    !isEdit && !isAutoNumber && !fields.creditNoteNumber.trim()
      ? "Enter a credit note number"
      : null;

  const blocker =
    draft?.refusal ??
    (!hasSomething ? "Tick at least one line to credit" : null) ??
    (!linesValid ? "Fix the lines marked in red" : null) ??
    dateError ??
    numberError ??
    previewError;

  const create = useCreateCreditNoteMutation();
  const update = useUpdateCreditNoteMutation();

  const common = () => ({
    date: fields.date || undefined,
    ...(fields.reason ? { reason: fields.reason } : {}),
    reasonNote: fields.reasonNote.trim() || null,
    notes: fields.notes.trim() || null,
    referenceNumber: fields.referenceNumber.trim() || undefined,
    templateId: fields.templateId || null,
    lines: payload?.lines ?? [],
    ...(showShipping ? { shippingCharge: shipping } : {}),
    ...(showAdjustment ? { adjustment } : {}),
  });

  const submit = async (status: "OPEN" | "DRAFT" = "OPEN") => {
    setSubmitted(true);
    if (blocker || !invoiceId) return;

    if (note) {
      const res = await update.mutateAsync({ id: note.id, payload: common() });
      navigate(RouteConstants.creditNotes.detail.generate({ id: res.data.id }));
      return;
    }

    const res = await create.mutateAsync({
      invoiceId,
      ...common(),
      status,
      applyToInvoice: fields.applyToInvoice,
      ...(!isAutoNumber
        ? { creditNoteNumber: fields.creditNoteNumber.trim() }
        : {}),
    });
    const saved = res.data;
    const applied = Number(saved.amountApplied);
    const left = Number(saved.balance);
    const invoiceNumber = draft?.invoice.invoiceNumber ?? "the invoice";
    toaster.create({
      type: "success",
      description:
        status === "DRAFT"
          ? `${saved.creditNoteNumber} saved as a draft.`
          : [
              `${saved.creditNoteNumber} saved.`,
              applied > 0
                ? `${formatMoney(applied)} applied to ${invoiceNumber}.`
                : "",
              left > 0 ? `${formatMoney(left)} is open credit.` : "",
            ]
              .filter(Boolean)
              .join(" "),
    });
    navigate(RouteConstants.creditNotes.detail.generate({ id: saved.id }));
  };

  return {
    isEdit,
    draft,
    isDraftLoading: draftQuery.isLoading,
    draftError: draftQuery.isError ? getErrorMessage(draftQuery.error) : null,
    lines,
    rows,
    setRow,
    lineErrors,
    fields,
    setField,
    isAutoNumber,
    showShipping,
    showAdjustment,
    preview,
    isPreviewing: previewQuery.isFetching || payload !== debounced,
    previewError,
    dateError,
    numberError,
    blocker,
    submitted,
    submit,
    isSaving: create.isPending || update.isPending,
  };
}
