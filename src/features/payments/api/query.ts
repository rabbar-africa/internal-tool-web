import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "./service";
import type {
  CreatePaymentPayload,
  IGetPaymentsReceivedFilter,
} from "@/shared/interface/payment";
import { customQueryKey } from "@/shared/constants/query-keys";

const KEYS = {
  all: ["payments"] as const,
  list: (filter?: IGetPaymentsReceivedFilter) =>
    ["payments", "list", filter] as const,
  detail: (id: string) => ["payments", "detail", id] as const,
};

// A payment updates the invoice it settles and, if that invoice is linked to a
// job card, the job card's collected/outstanding figures — refresh both.
const invalidateLinkedRecords = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: KEYS.all });
  queryClient.invalidateQueries({ queryKey: [customQueryKey.invoices.getAll] });
  queryClient.invalidateQueries({
    queryKey: [customQueryKey.invoices.getById],
  });
  queryClient.invalidateQueries({
    queryKey: [customQueryKey.jobCards.getById],
  });
  queryClient.invalidateQueries({
    queryKey: [customQueryKey.jobCards.financials],
  });
};

export const useGetPaymentsQuery = (filter?: IGetPaymentsReceivedFilter) =>
  useQuery({
    queryKey: KEYS.list(filter),
    queryFn: () => getPayments(filter),
  });

export const useGetPaymentByIdQuery = (id: string) =>
  useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getPaymentById(id),
    enabled: Boolean(id),
  });

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: () => invalidateLinkedRecords(queryClient),
    meta: { successMessage: "Payment recorded successfully" },
  });
};

export const useUpdatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; payload: CreatePaymentPayload }) =>
      updatePayment(data),
    onSuccess: () => invalidateLinkedRecords(queryClient),
    meta: { successMessage: "Payment updated successfully" },
  });
};

export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => invalidateLinkedRecords(queryClient),
    meta: { successMessage: "Payment deleted successfully" },
  });
};
