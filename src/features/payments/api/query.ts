import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import { getPayments, createPayment } from "./service";
import type { CreatePaymentPayload } from "@/shared/interface/payment";

const KEYS = { all: ["payments"] as const };

export const useGetPaymentsQuery = () =>
  useQuery({ queryKey: KEYS.all, queryFn: getPayments });

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Payment recorded successfully" },
  });
};
