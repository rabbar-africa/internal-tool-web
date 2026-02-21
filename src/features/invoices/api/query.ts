import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import { getInvoices, getInvoiceById, createInvoice } from "./service";
import type { CreateInvoicePayload } from "@/shared/interface/invoice";

const KEYS = {
  all: ["invoices"] as const,
  detail: (id: string) => ["invoices", id] as const,
};

export const useGetInvoicesQuery = () =>
  useQuery({ queryKey: KEYS.all, queryFn: getInvoices });

export const useGetInvoiceByIdQuery = (id: string) =>
  useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: Boolean(id),
  });

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
    meta: { successMessage: "Invoice created successfully" },
  });
};
