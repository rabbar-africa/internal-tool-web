import { Button, type ButtonProps } from "@chakra-ui/react";
import { useCheckoutMutation } from "../api/query";
import type { BillingInterval, PlanTier } from "../api/types";

interface PayNowButtonProps extends Omit<ButtonProps, "onClick"> {
  planTier: PlanTier;
  /** How they renew; the API charges a month when it's left out. */
  billingInterval?: BillingInterval;
}

/**
 * Renews `planTier` through Paystack — transfer-first, so the card is never
 * saved from here.
 */
export function PayNowButton({
  planTier,
  billingInterval,
  children = "Pay now",
  ...props
}: PayNowButtonProps) {
  const { mutate, isPending, isSuccess, data } = useCheckoutMutation();
  // Keep the spinner while the browser navigates away to Paystack.
  const redirecting = isSuccess && data?.status === "redirect";

  return (
    <Button
      variant="accent"
      loading={isPending || redirecting}
      loadingText="Opening payment…"
      onClick={() =>
        mutate({
          planTier,
          saveCard: false,
          ...(billingInterval ? { billingInterval } : {}),
        })
      }
      {...props}
    >
      {children}
    </Button>
  );
}
