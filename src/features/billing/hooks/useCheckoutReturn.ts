import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { useSearchParams } from "react-router-dom";
import { toaster } from "@/components/ui";
import { useQueryClient } from "@/lib/react-query";
import { BILLING_OVERVIEW_KEY, useCheckoutStatusQuery } from "../api/query";
import { formatLongDate } from "../utils/format";

const POLL_INTERVAL_MS = 3_000;
const MAX_WAIT_MS = 90_000;

/**
 * Paystack sends the user back with `?reference=…&trxref=…`. Confirms that
 * payment in the background: once it's settled, toasts the outcome and takes
 * the params off the URL, so a refresh or a shared link doesn't repeat it.
 * Bank transfers can take a minute, so a pending one is polled before giving up.
 */
export function useCheckoutReturn() {
  const [params, setParams] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const queryClient = useQueryClient();

  // Bumped by "Check again" to restart the polling window.
  const [round, setRound] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!reference) return;
    setTimedOut(false);
    const timer = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [reference, round]);

  const { data, error, refetch, isFetching } = useCheckoutStatusQuery(
    reference,
    !timedOut,
    POLL_INTERVAL_MS,
  );

  const dismiss = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("reference");
        next.delete("trxref");
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  const status = data?.status;
  const notFound = (error as AxiosError | null)?.response?.status === 404;
  const settled =
    status === "SUCCESS" ||
    status === "FAILED" ||
    status === "ABANDONED" ||
    notFound;

  // Each payment is announced once, however often this re-renders.
  const announced = useRef("");
  useEffect(() => {
    if (!reference || !settled || announced.current === reference) return;
    announced.current = reference;

    if (status === "SUCCESS") {
      queryClient.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY });
      const until = formatLongDate(data?.currentPeriodEnd);
      const plan = data?.plan?.name;
      toaster.create({
        type: "success",
        description:
          data?.purpose === "CARD_SETUP"
            ? "Card saved for automatic renewal. The ₦50 check will be refunded to you."
            : plan && until
              ? `Payment received. Your ${plan} plan is active until ${until}.`
              : "Payment received. Your plan is active. Thank you!",
      });
    } else if (notFound) {
      toaster.create({
        type: "warning",
        description:
          "We couldn't find this payment. If you've paid, we'll email you once it's confirmed.",
      });
    } else {
      toaster.create({
        type: "error",
        description:
          "Your payment didn't go through. You can try again by bank transfer, USSD or card.",
      });
    }
    dismiss();
  }, [reference, settled, status, notFound, data, queryClient, dismiss]);

  return {
    isConfirming: Boolean(reference) && !settled,
    isCardCheck: data?.purpose === "CARD_SETUP",
    timedOut,
    isChecking: isFetching,
    checkAgain: () => {
      setRound((r) => r + 1);
      void refetch();
    },
    dismiss,
  };
}
