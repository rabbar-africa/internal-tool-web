import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import type { AxiosError } from "axios";
import { Navigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@/lib/react-query";
import { Head } from "@/components/seo/head";
import { RouteConstants } from "@/shared/constants/routes";
import { getToken } from "@/utils/persistToken";
import { BILLING_OVERVIEW_KEY, useCheckoutStatusQuery } from "../api/query";
import { BillingMessage } from "../components/BillingMessage";
import { ReturnActions } from "../components/ReturnActions";
import { formatLongDate } from "../utils/format";

const POLL_INTERVAL_MS = 3_000;
const MAX_WAIT_MS = 90_000;

/**
 * `/billing/callback?reference=…` — where Paystack returns an emailed "Pay now"
 * link, whose payer is often logged out. Anyone logged in is better off on
 * their billing page, which confirms the payment in the background.
 */
export function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";

  if (getToken()?.accessToken) {
    return (
      <Navigate
        to={RouteConstants.settings.billing.generate(
          {},
          reference ? { reference } : undefined,
        )}
        replace
      />
    );
  }
  return <PublicPaymentStatus reference={reference} />;
}

/** Bank transfers can take a minute, so poll before giving up. */
function PublicPaymentStatus({ reference }: { reference: string }) {
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

  const succeeded = data?.status === "SUCCESS";
  useEffect(() => {
    if (succeeded) {
      queryClient.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY });
    }
  }, [succeeded, queryClient]);

  // Most people here paid a link from WhatsApp and have never logged in.
  const onWhatsapp = data?.onWhatsapp;
  const actions = (
    <ReturnActions
      onWhatsapp={onWhatsapp}
      to={RouteConstants.auth.login.path}
      label="Log in"
    />
  );

  const notFound =
    !reference || (error as AxiosError | null)?.response?.status === 404;

  if (notFound) {
    return (
      <>
        <Head title="Payment" />
        <BillingMessage
          tone="warning"
          title="We couldn't find this payment"
          body="If you've paid, we'll email you once it's confirmed. You can also check your billing page."
          actions={actions}
        />
      </>
    );
  }

  if (succeeded && data.purpose === "CARD_SETUP") {
    return (
      <>
        <Head title="Card saved" />
        <BillingMessage
          tone="success"
          title="Card saved"
          body="Your card is saved for automatic renewal. The ₦50 check will be refunded to you."
          actions={actions}
        />
      </>
    );
  }

  if (succeeded) {
    const until = formatLongDate(data.currentPeriodEnd);
    const plan = data.plan?.name;
    return (
      <>
        <Head title="Payment received" />
        <BillingMessage
          tone="success"
          title="Payment received"
          body={[
            plan && until
              ? `Your ${plan} plan is active until ${until}.`
              : "Your plan is active. Thank you!",
            onWhatsapp ? "Go back to WhatsApp and carry on." : "",
          ]
            .filter(Boolean)
            .join(" ")}
          actions={actions}
        />
      </>
    );
  }

  if (data?.status === "FAILED" || data?.status === "ABANDONED") {
    return (
      <>
        <Head title="Payment not completed" />
        <BillingMessage
          tone="error"
          title="Your payment didn't go through"
          body={
            onWhatsapp
              ? "Open the payment link again to try once more, by bank transfer, USSD or card."
              : "You can try again from your billing page, by bank transfer, USSD or card."
          }
          actions={actions}
        />
      </>
    );
  }

  // Still pending — or we stopped waiting.
  const isCardCheck = data?.purpose === "CARD_SETUP";
  return (
    <>
      <Head title="Confirming payment" />
      <BillingMessage
        tone={timedOut ? "warning" : "pending"}
        title="We're confirming your payment"
        body={
          isCardCheck
            ? "This can take a minute. You can close this page; we'll email you once your card is saved."
            : onWhatsapp
              ? "Bank transfers can take a minute. You can go back to WhatsApp: your plan switches on by itself once it's confirmed, and we'll email you."
              : "Bank transfers can take a minute. You can close this page; we'll email you once it's confirmed."
        }
        actions={
          <>
            {timedOut && (
              <Button
                variant="outline"
                w="full"
                loading={isFetching}
                onClick={() => {
                  setRound((r) => r + 1);
                  void refetch();
                }}
              >
                Check again
              </Button>
            )}
            {actions}
          </>
        }
      />
    </>
  );
}
