import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryConfigType,
} from "@/lib/react-query";
import type { ApiResponse } from "@/shared/interface/api";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";
import type {
  ApplyCreditPayload,
  CreateCreditNotePayload,
  ICreditNote,
  IGetCreditNoteFilter,
  PreviewCreditNotePayload,
  RefundCreditNotePayload,
  UpdateCreditNotePayload,
} from "@/shared/interface/credit-note";
import {
  applyCreditNote,
  createCreditNote,
  deleteCreditNote,
  deleteCreditRefund,
  getCreditNoteById,
  getCreditNoteDraft,
  getCreditNotes,
  getCustomerCredit,
  issueCreditNote,
  previewCreditNote,
  refundCreditNote,
  removeCreditApplication,
  updateCreditNote,
  voidCreditNote,
} from "./service";

const keys = customQueryKey.creditNotes;

/**
 * Writes answer with the credit note as it now is: show that at once rather
 * than the old copy until the refetch lands.
 */
function useCacheCreditNote() {
  const queryClient = useQueryClient();
  return (response: ApiResponse<ICreditNote>) => {
    if (!response?.data?.id) return;
    queryClient.setQueryData([keys.getById, response.data.id], response);
  };
}

export const useGetCreditNotesQuery = (
  filter?: IGetCreditNoteFilter,
  config?: QueryConfigType<typeof getCreditNotes>,
) =>
  useQuery({
    queryKey: [keys.getAll, filter],
    queryFn: () => getCreditNotes(filter),
    ...config,
  });

export const useGetCreditNoteByIdQuery = (id: string) =>
  useQuery({
    queryKey: [keys.getById, id],
    queryFn: () => getCreditNoteById(id),
    enabled: Boolean(id),
  });

export const useGetCreditNoteDraftQuery = (
  invoiceId?: string | null,
  creditNoteId?: string,
) =>
  useQuery({
    queryKey: [keys.draft, invoiceId, creditNoteId],
    queryFn: () => getCreditNoteDraft(invoiceId as string, creditNoteId),
    enabled: Boolean(invoiceId),
    // What's left to credit moves whenever anyone credits the invoice.
    staleTime: 0,
  });

/**
 * The totals for what's ticked on the form, from the API. Keyed by the
 * request, so the same choice is never asked twice; the caller debounces.
 */
export const useCreditNotePreviewQuery = (
  payload: PreviewCreditNotePayload | null,
) =>
  useQuery({
    queryKey: [keys.preview, payload],
    queryFn: () => previewCreditNote(payload as PreviewCreditNotePayload),
    enabled: Boolean(payload?.lines?.length),
    staleTime: 0,
    // A 400 here is the API saying the choice isn't allowed: the form shows it.
    retry: false,
    placeholderData: (previous) => previous,
  });

export const useGetCustomerCreditQuery = (customerId?: string | null) =>
  useQuery({
    queryKey: [keys.customerCredit, customerId],
    queryFn: () => getCustomerCredit(customerId as string),
    enabled: Boolean(customerId),
  });

/** The page says what happened: the toast names what was applied. */
export const useCreateCreditNoteMutation = () =>
  useMutation({
    mutationFn: (payload: CreateCreditNotePayload) => createCreditNote(payload),
    meta: { invalidatesQueryKeys: invalidates.creditNoteCreated },
  });

export const useUpdateCreditNoteMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCreditNotePayload;
    }) => updateCreditNote(id, payload),
    onSuccess: cache,
    meta: {
      successMessage: "Credit note updated",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });
};

export const useIssueCreditNoteMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({
      id,
      applyToInvoice,
    }: {
      id: string;
      applyToInvoice: boolean;
    }) => issueCreditNote(id, applyToInvoice),
    onSuccess: cache,
    meta: {
      successMessage: "Credit note issued",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });
};

export const useVoidCreditNoteMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: (id: string) => voidCreditNote(id),
    onSuccess: cache,
    meta: {
      successMessage: "Credit note voided",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });
};

export const useDeleteCreditNoteMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteCreditNote(id),
    meta: {
      successMessage: "Draft credit note deleted",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });

export const useApplyCreditNoteMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ApplyCreditPayload;
    }) => applyCreditNote(id, payload),
    onSuccess: cache,
    meta: {
      successMessage: "Credit applied",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });
};

export const useRemoveCreditApplicationMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({
      id,
      applicationId,
    }: {
      id: string;
      applicationId: string;
    }) => removeCreditApplication(id, applicationId),
    onSuccess: cache,
    meta: {
      successMessage: "Credit removed from the invoice",
      invalidatesQueryKeys: invalidates.creditNote,
    },
  });
};

export const useRefundCreditNoteMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RefundCreditNotePayload;
    }) => refundCreditNote(id, payload),
    onSuccess: cache,
    meta: {
      successMessage: "Refund recorded",
      invalidatesQueryKeys: invalidates.creditNoteRefund,
    },
  });
};

export const useDeleteCreditRefundMutation = () => {
  const cache = useCacheCreditNote();
  return useMutation({
    mutationFn: ({ id, refundId }: { id: string; refundId: string }) =>
      deleteCreditRefund(id, refundId),
    onSuccess: cache,
    meta: {
      successMessage: "Refund deleted",
      invalidatesQueryKeys: invalidates.creditNoteRefund,
    },
  });
};
