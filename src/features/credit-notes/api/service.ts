import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  ApplyCreditPayload,
  CreateCreditNotePayload,
  CreditNoteDraft,
  CreditNotePreview,
  PreviewCreditNotePayload,
  CustomerCredit,
  ICreditNote,
  IGetCreditNoteFilter,
  RefundCreditNotePayload,
  UpdateCreditNotePayload,
} from "@/shared/interface/credit-note";

export const getCreditNotes = async (filter?: IGetCreditNoteFilter) => {
  const url = buildUrlWithQueryParams("/credit-notes", filter);
  const { data } = await axios.get<ApiResponse<ICreditNote[]>>(url);
  return data;
};

export const getCreditNoteById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}`,
  );
  return data;
};

/**
 * An invoice's lines and how much of each can still be credited. Editing a
 * note: pass its id, so its own lines aren't counted against it.
 */
export const getCreditNoteDraft = async (
  invoiceId: string,
  creditNoteId?: string,
) => {
  const url = buildUrlWithQueryParams(
    `/invoices/${invoiceId}/credit-note-draft`,
    creditNoteId ? { creditNoteId } : undefined,
  );
  const { data } = await axios.get<ApiResponse<CreditNoteDraft>>(url);
  return data;
};

/**
 * The money exactly as it would be saved; nothing is saved. Shown as is: the
 * API applies the invoice's own discount and VAT rate, and the note that
 * finishes an invoice takes what's left to the kobo.
 */
export const previewCreditNote = async (payload: PreviewCreditNotePayload) => {
  const { data } = await axios.post<ApiResponse<CreditNotePreview>>(
    "/credit-notes/preview",
    payload,
  );
  return data;
};

export const createCreditNote = async (payload: CreateCreditNotePayload) => {
  const { data } = await axios.post<ApiResponse<ICreditNote>>(
    "/credit-notes",
    payload,
  );
  return data;
};

export const updateCreditNote = async (
  id: string,
  payload: UpdateCreditNotePayload,
) => {
  const { data } = await axios.put<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}`,
    payload,
  );
  return data;
};

export const issueCreditNote = async (id: string, applyToInvoice: boolean) => {
  const { data } = await axios.post<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/issue`,
    { applyToInvoice },
  );
  return data;
};

export const voidCreditNote = async (id: string) => {
  const { data } = await axios.post<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/void`,
  );
  return data;
};

/** Drafts only; an issued note is a tax record, so it is voided instead. */
export const deleteCreditNote = async (id: string) => {
  await axios.delete(`/credit-notes/${id}`);
};

export const applyCreditNote = async (
  id: string,
  payload: ApplyCreditPayload,
) => {
  const { data } = await axios.post<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/applications`,
    payload,
  );
  return data;
};

export const removeCreditApplication = async (
  id: string,
  applicationId: string,
) => {
  const { data } = await axios.delete<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/applications/${applicationId}`,
  );
  return data;
};

export const refundCreditNote = async (
  id: string,
  payload: RefundCreditNotePayload,
) => {
  const { data } = await axios.post<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/refunds`,
    payload,
  );
  return data;
};

export const deleteCreditRefund = async (id: string, refundId: string) => {
  const { data } = await axios.delete<ApiResponse<ICreditNote>>(
    `/credit-notes/${id}/refunds/${refundId}`,
  );
  return data;
};

/** The PDF the business sends the customer, drawn by the API. */
export const getCreditNotePdf = async (id: string) => {
  const { data } = await axios.get<Blob>(`/credit-notes/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
};

/** A customer's open credit: credit notes and payments with unused money. */
export const getCustomerCredit = async (customerId: string) => {
  const { data } = await axios.get<ApiResponse<CustomerCredit>>(
    `/clients/${customerId}/credit`,
  );
  return data;
};
