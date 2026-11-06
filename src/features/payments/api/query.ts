import { useQuery, useMutation } from "@/lib/react-query";
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
import { invalidates } from "@/shared/constants/query-invalidations";

// Mutations invalidate the whole `customQueryKey.payments.all` prefix.
const KEYS = {
  list: (filter?: IGetPaymentsReceivedFilter) =>
    [customQueryKey.payments.all, "list", filter] as const,
  detail: (id: string) => [customQueryKey.payments.all, "detail", id] as const,
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
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    meta: {
      successMessage: "Payment recorded successfully",
      invalidatesQueryKeys: invalidates.paymentCreated,
    },
  });
};

export const useUpdatePaymentMutation = () => {
  return useMutation({
    mutationFn: (data: { id: string; payload: CreatePaymentPayload }) =>
      updatePayment(data),
    meta: {
      successMessage: "Payment updated successfully",
      invalidatesQueryKeys: invalidates.payment,
    },
  });
};

export const useDeletePaymentMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    meta: {
      successMessage: "Payment deleted successfully",
      invalidatesQueryKeys: invalidates.payment,
    },
  });
};
