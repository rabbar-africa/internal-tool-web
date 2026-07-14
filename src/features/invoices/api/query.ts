import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  getInvoiceById,
  createInvoice,
  updateInvoice,
  writeOffInvoice,
  cancelWriteOffInvoice,
  recalculateInvoice,
  getAllInvoices,
  deleteInvoice,
  getOutstandingInvoices,
  addCarriedInvoice,
  removeCarriedInvoice,
  collectInvoicePayment,
  type WriteOffInvoicePayload,
} from "./service";
import type {
  CreateInvoicePayload,
  UpdateInvoicePayload,
  IGetInvoiceFilter,
  CollectInvoicePaymentPayload,
} from "@/shared/interface/invoice";
import { customQueryKey } from "@/shared/constants/query-keys";

export const useGetAllInvoicesQuery = (
  filter?: IGetInvoiceFilter,
  config?: QueryConfigType<typeof getAllInvoices>,
) => {
  return useQuery({
    queryKey: [customQueryKey.invoices.getAll, filter],
    queryFn: () => getAllInvoices(filter),
    ...config,
  });
};

export const useGetInvoiceByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.invoices.getById, id],
    queryFn: () => getInvoiceById(id),
    enabled: Boolean(id),
  });

export const useCreateInvoiceMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),

    meta: {
      successMessage: "Invoice created successfully",
      // A linked job card's invoice list + P&L change when a new invoice is
      // raised against it, so refresh those too.
      invalidatesQueryKeys: [
        [customQueryKey.invoices.getAll],
        [customQueryKey.jobCards.getById],
        [customQueryKey.jobCards.financials],
      ],
    },
  });
};

export const useUpdateInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInvoicePayload;
    }) => updateInvoice(id, payload),

    meta: {
      successMessage: "Invoice updated successfully",
      invalidatesQueryKeys: [
        [customQueryKey.invoices.getAll],
        [customQueryKey.invoices.getById],
      ],
    },
  });
};

export const useWriteOffInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & WriteOffInvoicePayload) =>
      writeOffInvoice(id, payload),
    meta: {
      successMessage: "Invoice written off",
      invalidatesQueryKeys: [
        [customQueryKey.invoices.getAll],
        [customQueryKey.invoices.getById],
      ],
    },
  });
};

export const useCancelWriteOffInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => cancelWriteOffInvoice(id),
    meta: {
      successMessage: "Write-off cancelled",
      invalidatesQueryKeys: [
        [customQueryKey.invoices.getAll],
        [customQueryKey.invoices.getById],
      ],
    },
  });
};

export const useRecalculateInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => recalculateInvoice(id),
    meta: {
      successMessage: "Invoice balance recalculated",
      invalidatesQueryKeys: [
        [customQueryKey.invoices.getAll],
        [customQueryKey.invoices.getById],
      ],
    },
  });
};

/** The same customer's other unpaid invoices eligible to bring forward. */
export const useGetOutstandingInvoicesQuery = (
  id: string,
  config?: QueryConfigType<typeof getOutstandingInvoices>,
) =>
  useQuery({
    queryKey: [customQueryKey.invoices.outstanding, id],
    queryFn: () => getOutstandingInvoices(id),
    enabled: Boolean(id),
    ...config,
  });

// Bringing a balance forward changes what's eligible elsewhere (a balance may
// only ride on one document), so the outstanding lists are invalidated too.
const carryInvalidations = [
  [customQueryKey.invoices.getById],
  [customQueryKey.invoices.getAll],
  [customQueryKey.invoices.outstanding],
] as const;

export const useAddCarriedInvoiceMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      carriedInvoiceId,
    }: {
      id: string;
      carriedInvoiceId: string;
    }) => addCarriedInvoice(id, carriedInvoiceId),
    meta: {
      successMessage: "Previous balance brought forward",
      invalidatesQueryKeys: carryInvalidations,
    },
  });

export const useRemoveCarriedInvoiceMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      carriedInvoiceId,
    }: {
      id: string;
      carriedInvoiceId: string;
    }) => removeCarriedInvoice(id, carriedInvoiceId),
    meta: {
      successMessage: "Previous balance removed",
      invalidatesQueryKeys: carryInvalidations,
    },
  });

/**
 * Records a payment against an invoice, letting the server split it across any
 * brought-forward invoices (oldest first) and then this invoice.
 */
export const useCollectInvoicePaymentMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CollectInvoicePaymentPayload;
    }) => collectInvoicePayment(id, payload),
    meta: {
      successMessage: "Payment recorded successfully",
      // One payment can settle several invoices across different job cards,
      // so refresh the payment lists and job-card figures as well.
      invalidatesQueryKeys: [
        ...carryInvalidations,
        // The payments feature keys its queries under a local ["payments"]
        // prefix rather than customQueryKey; this matches KEYS.all there.
        ["payments"],
        [customQueryKey.jobCards.getById],
        [customQueryKey.jobCards.financials],
      ],
    },
  });

export const useDeleteInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    meta: {
      successMessage: "Invoice deleted",
      invalidatesQueryKeys: [[customQueryKey.invoices.getAll]],
    },
  });
};
