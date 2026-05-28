import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  getInvoiceById,
  createInvoice,
  getAllInvoices,
  deleteInvoice,
} from "./service";
import type {
  CreateInvoicePayload,
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
      successMessage: "Customer created successfully",
      invalidatesQueryKeys: [[customQueryKey.invoices.getAll]],
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
