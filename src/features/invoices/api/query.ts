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
  type WriteOffInvoicePayload,
} from "./service";
import type {
  CreateInvoicePayload,
  UpdateInvoicePayload,
  IGetInvoiceFilter,
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

export const useDeleteInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    meta: {
      successMessage: "Invoice deleted",
      invalidatesQueryKeys: [[customQueryKey.invoices.getAll]],
    },
  });
};
