import { Box, Button, Stack, Text } from "@chakra-ui/react";
import type { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { Head } from "@/components/seo/head";
import { RouteConstants } from "@/shared/constants/routes";
import { getErrorMessage } from "@/utils/handle-error";
import { getToken } from "@/utils/persistToken";
import { usePayFromLinkMutation, usePayLinkQuery } from "../api/query";
import type { PayLinkSummary } from "../api/types";
import { BillingMessage } from "../components/BillingMessage";
import { ReturnActions } from "../components/ReturnActions";
import { PAYMENT_OPTIONS_NOTE } from "../utils/copy";
import { formatLongDate, formatPrice } from "../utils/format";

function describeLinkStatus(summary: PayLinkSummary) {
  // A link from Rabbar support for one plan: often a move up from Starter,
  // so nothing about the plan they are on now.
  if (summary.kind === "PLAN") {
    const until = formatLongDate(summary.expiresAt);
    return [
      `Pay to put ${summary.organizationName} on ${summary.plan.name}. It switches on as soon as your payment comes through.`,
      until ? `This link works until ${until}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  const end = formatLongDate(summary.currentPeriodEnd);
  switch (summary.status) {
    case "PAST_DUE":
      return end
        ? `Your plan ended on ${end}. Pay now to keep using it.`
        : "Your plan is due. Pay now to keep using it.";
    case "EXPIRED":
      return end
        ? `Your plan ended on ${end}. Pay now to get it back.`
        : "Your plan has ended. Pay now to get it back.";
    default:
      return end
        ? `Your plan ends on ${end}. Pay now so it keeps running.`
        : "Pay now so your plan keeps running.";
  }
}

/** What the amount pays for, under the price. */
function coverLabel(summary: PayLinkSummary): string {
  if (summary.billingInterval === "ANNUAL") return "For 1 year";
  if (summary.periodMonths > 1) return `Covers ${summary.periodMonths} months`;
  // A renewal says nothing for a month, as before; a support link spells it out.
  return summary.kind === "PLAN" ? "For 1 month" : "";
}

/**
 * `/billing/pay/:token` — the "Pay now" link from billing emails, and payment
 * links Rabbar support makes for one plan. Works without logging in.
 */
export function PayLinkPage() {
  const { token = "" } = useParams<{ token: string }>();
  const { data: summary, isLoading, error } = usePayLinkQuery(token);
  const pay = usePayFromLinkMutation();

  const redirecting = pay.isSuccess && pay.data?.status === "redirect";
  const activated = pay.isSuccess && pay.data?.status === "activated";

  const isLoggedIn = Boolean(getToken()?.accessToken);
  const billingActions = (onWhatsapp?: boolean) => (
    <ReturnActions
      onWhatsapp={onWhatsapp}
      to={
        isLoggedIn
          ? RouteConstants.settings.billing.path
          : RouteConstants.auth.login.path
      }
      label={isLoggedIn ? "Go to my billing page" : "Log in"}
    />
  );

  if (isLoading) return <SectionLoader h="12rem" />;

  if (error || !summary) {
    const status = (error as AxiosError | null)?.response?.status;
    const notFound = status === 404;
    // A link from Rabbar support that expired or was cancelled; the message
    // says to ask for a new one.
    const gone = status === 410;
    return (
      <>
        <Head title="Payment link" />
        <BillingMessage
          tone="warning"
          title={
            notFound
              ? "This payment link has already been used"
              : gone
                ? "This payment link no longer works"
                : "We couldn't open this payment link"
          }
          body={
            notFound
              ? "Each link only works once. If you've already paid, your plan is already on."
              : getErrorMessage(error) || "Please try again in a moment."
          }
          // Only support's links can expire or be cancelled, and nearly all
          // of those go to people who work in WhatsApp.
          actions={billingActions(gone ? true : undefined)}
        />
      </>
    );
  }

  if (activated) {
    return (
      <>
        <Head title="Plan active" />
        <BillingMessage
          tone="success"
          title="You're all set"
          body={`Your ${summary.plan.name} plan is active. Nothing to pay.`}
          actions={billingActions(summary.onWhatsapp)}
        />
      </>
    );
  }

  const amount = formatPrice(summary.amount, summary.currency);

  return (
    <Stack gap="6">
      <Head title={`Pay for ${summary.plan.name}`} />

      <Box>
        <Text fontSize="13px" color="gray.300">
          {summary.organizationName}
        </Text>
        <Text as="h1" fontSize="1.5rem" fontWeight="700" color="primary.500">
          {summary.plan.name} plan
        </Text>
        <Text fontSize="14px" color="gray.400" mt="1" lineHeight="1.6">
          {describeLinkStatus(summary)}
        </Text>
      </Box>

      <Box
        p="4"
        rounded="lg"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Text fontSize="13px" color="gray.400">
          Amount to pay
        </Text>
        <Text
          fontSize="2rem"
          fontWeight="700"
          color="gray.500"
          lineHeight="1.2"
        >
          {amount}
        </Text>
        {coverLabel(summary) && (
          <Text fontSize="13px" color="gray.400">
            {coverLabel(summary)}
          </Text>
        )}
        {summary.promoDescription && (
          <Text fontSize="13px" color="success.300" mt="1">
            Promo: {summary.promoDescription}
            {summary.discountAmount > 0
              ? ` (you save ${formatPrice(summary.discountAmount, summary.currency)})`
              : ""}
          </Text>
        )}
      </Box>

      <Stack gap="2">
        <Button
          variant="accent"
          w="full"
          onClick={() => pay.mutate(token)}
          loading={pay.isPending || redirecting}
          loadingText="Opening payment…"
        >
          {summary.amount > 0 ? `Pay ${amount}` : "Activate my plan"}
        </Button>
        <Text fontSize="13px" color="gray.300" textAlign="center">
          {PAYMENT_OPTIONS_NOTE}
        </Text>
      </Stack>
    </Stack>
  );
}
