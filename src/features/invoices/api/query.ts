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
  getInvoiceDeleteImpact,
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
  DeleteInvoiceOptions,
} from "@/shared/interface/invoice";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";

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
      invalidatesQueryKeys: invalidates.invoiceCreated,
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
      invalidatesQueryKeys: invalidates.invoice,
    },
  });
};

export const useWriteOffInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & WriteOffInvoicePayload) =>
      writeOffInvoice(id, payload),
    meta: {
      successMessage: "Invoice written off",
      invalidatesQueryKeys: invalidates.invoice,
    },
  });
};

export const useCancelWriteOffInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => cancelWriteOffInvoice(id),
    meta: {
      successMessage: "Write-off cancelled",
      invalidatesQueryKeys: invalidates.invoice,
    },
  });
};

export const useRecalculateInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => recalculateInvoice(id),
    meta: {
      successMessage: "Invoice balance recalculated",
      invalidatesQueryKeys: invalidates.invoice,
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
      invalidatesQueryKeys: invalidates.invoice,
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
      invalidatesQueryKeys: invalidates.invoice,
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
      // One payment can settle several invoices across different job cards.
      invalidatesQueryKeys: invalidates.paymentCreated,
    },
  });

export const useGetInvoiceDeleteImpactQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.invoices.deleteImpact, id],
    queryFn: () => getInvoiceDeleteImpact(id),
    enabled: Boolean(id),
    // Payments may have changed since this was last opened: always ask afresh.
    staleTime: 0,
    gcTime: 0,
  });

export const useDeleteInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      options,
    }: {
      id: string;
      options?: DeleteInvoiceOptions;
    }) => deleteInvoice(id, options),
    meta: {
      successMessage: "Invoice deleted",
      // Deleting can take its payments and expenses with it.
      invalidatesQueryKeys: [...invalidates.payment, ...invalidates.expense],
    },
  });
};
