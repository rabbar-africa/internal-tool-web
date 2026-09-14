import { useMutation, useQuery, useQueryClient } from "@/lib/react-query";
import type { AxiosError } from "axios";
import { toaster } from "@/components/ui";
import { customQueryKey } from "@/shared/constants/query-keys";
import { billingService } from "./service";
import type {
  BillingOverview,
  CheckoutPayload,
  CheckoutResult,
  PlanTier,
} from "./types";

/**
 * Shares its key with the subscription check in ProtectedRoutes — it is the
 * same endpoint — so a payment refreshes the gate, the banner and this page.
 */
export const BILLING_OVERVIEW_KEY = [
  customQueryKey.user.getCurrentSubscription,
] as const;

/** Sends the browser to Paystack's hosted checkout. */
export const goToPaystack = (url: string) => {
  window.location.href = url;
};

export const useBillingOverviewQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: BILLING_OVERVIEW_KEY,
    queryFn: () => billingService.getOverview(),
    enabled: options?.enabled ?? true,
  });

export const useBillingPlansQuery = () =>
  useQuery({
    queryKey: [customQueryKey.billing.plans],
    queryFn: () => billingService.getPlans(),
  });

/**
 * A query (not a mutation) so a bad promo code shows inline under the field
 * instead of as a global error toast.
 */
export const useCheckoutPreviewQuery = (
  planTier: PlanTier | null,
  promoCode: string,
) =>
  useQuery({
    queryKey: [customQueryKey.billing.checkoutPreview, planTier, promoCode],
    queryFn: () =>
      billingService.previewCheckout({
        planTier: planTier as PlanTier,
        ...(promoCode ? { promoCode } : {}),
      }),
    enabled: Boolean(planTier && planTier !== "STARTER"),
    staleTime: 60_000,
  });

/** Mutations that answer with the fresh overview write it straight to cache. */
const useOverviewMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<BillingOverview>,
  successMessage: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (overview) => {
      queryClient.setQueryData(BILLING_OVERVIEW_KEY, overview);
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.billing.checkoutPreview],
      });
    },
    meta: { successMessage },
  });
};

/** Handles both checkout outcomes: off to Paystack, or activated by a promo. */
const useHandleCheckoutResult = () => {
  const queryClient = useQueryClient();
  return (result: CheckoutResult) => {
    if (result.status === "redirect") {
      goToPaystack(result.authorizationUrl);
      return;
    }
    queryClient.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY });
    toaster.create({
      type: "success",
      description: "Done! Your plan is now active.",
    });
  };
};

export const useCheckoutMutation = () => {
  const handleResult = useHandleCheckoutResult();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => billingService.checkout(payload),
    onSuccess: handleResult,
  });
};

export const useAddCardMutation = () =>
  useMutation({
    mutationFn: () => billingService.addCard(),
    onSuccess: (result) => {
      if (result.status === "redirect") goToPaystack(result.authorizationUrl);
    },
  });

export const useRemoveCardMutation = () =>
  useOverviewMutation<void>(() => billingService.removeCard(), "Card removed");

export const useAutoRenewMutation = () =>
  useOverviewMutation(
    (autoRenew: boolean) => billingService.setAutoRenew(autoRenew),
    "Automatic renewal updated",
  );

export const useChangePlanMutation = () =>
  useOverviewMutation(
    (planTier: PlanTier) => billingService.changePlan(planTier),
    "Plan change saved",
  );

export const useCancelSubscriptionMutation = () =>
  useOverviewMutation<void>(
    () => billingService.cancel(),
    "Your plan will not renew",
  );

export const useResumeSubscriptionMutation = () =>
  useOverviewMutation<void>(
    () => billingService.resume(),
    "Your plan will continue as normal",
  );

// ─── Public (no login) ───────────────────────────────────────────────────────

export const usePayLinkQuery = (token: string) =>
  useQuery({
    queryKey: [customQueryKey.billing.payLink, token],
    queryFn: () => billingService.getPayLink(token),
    enabled: Boolean(token),
    retry: false,
  });

/**
 * Polls a checkout after Paystack sends the user back. Keeps going in the
 * background — people paying by transfer are usually in their bank app.
 */
export const useCheckoutStatusQuery = (
  reference: string,
  keepPolling: boolean,
  intervalMs: number,
) =>
  useQuery({
    queryKey: [customQueryKey.billing.checkoutStatus, reference],
    queryFn: () => billingService.getCheckoutStatus(reference),
    enabled: Boolean(reference),
    retry: false,
    staleTime: 0,
    refetchIntervalInBackground: true,
    refetchInterval: (query) => {
      if (!keepPolling) return false;
      const status = query.state.data?.status;
      if (status && status !== "PENDING") return false;
      const httpStatus = (query.state.error as AxiosError | null)?.response
        ?.status;
      if (httpStatus === 404) return false;
      return intervalMs;
    },
  });

export const usePayFromLinkMutation = () =>
  useMutation({
    mutationFn: (token: string) => billingService.payFromLink(token),
    onSuccess: (result) => {
      if (result.status === "redirect") goToPaystack(result.authorizationUrl);
    },
  });
