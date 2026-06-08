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

const KEYS = {
  all: ["payments"] as const,
  list: (filter?: IGetPaymentsReceivedFilter) =>
    ["payments", "list", filter] as const,
  detail: (id: string) => ["payments", "detail", id] as const,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Payment recorded successfully" },
  });
};

export const useUpdatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; payload: CreatePaymentPayload }) =>
      updatePayment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Payment updated successfully" },
  });
};

export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Payment deleted successfully" },
  });
};
