import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { SectionTitle } from "@/features/settings/components/SectionTitle";
import {
  useBillingIntervalMutation,
  useResumeSubscriptionMutation,
} from "../api/query";
import type { BillingOverview } from "../api/types";
import {
  ASK_ADMIN_NOTE,
  PAYMENT_OPTIONS_NOTE,
  TONE_STYLES,
  describeDue,
  describePlanSummary,
  describeStatus,
  isPaidPlan,
} from "../utils/copy";
import { formatLongDate, formatPrice } from "../utils/format";
import {
  describeAnnualSaving,
  describePlanPrice,
  describeRenewalPrice,
  renewalInterval,
  sellsYearly,
} from "../utils/interval";
import { PayNowButton } from "./PayNowButton";

interface CurrentPlanSectionProps {
  overview: BillingOverview;
  canManage: boolean;
}

export function CurrentPlanSection({
  overview,
  canManage,
}: CurrentPlanSectionProps) {
  const { plan, pendingPlan, billing, activePromo } = overview;
  const { mutate: resume, isPending: resuming } =
    useResumeSubscriptionMutation();
  const { mutate: switchInterval, isPending: switchingInterval } =
    useBillingIntervalMutation();

  const status = describeStatus(overview);
  const statusTone = TONE_STYLES[status.tone];
  const due = describeDue(overview);
  const interval = renewalInterval(overview);
  const renewing = pendingPlan ?? plan;
  const renewsOn =
    overview.status === "ACTIVE" &&
    isPaidPlan(plan) &&
    !overview.cancelAtPeriodEnd &&
    overview.currentPeriodEnd
      ? formatLongDate(overview.currentPeriodEnd)
      : "";
  // Switching only changes the next renewal, never what's already paid for.
  const yearlySaving = describeAnnualSaving(
    {
      annualSaving: billing.annualSaving ?? renewing.annualSaving,
      annualMonthsFree: renewing.annualMonthsFree,
    },
    renewing.currency,
  );
  const intervalSwitch =
    canManage && isPaidPlan(renewing) && !overview.cancelAtPeriodEnd
      ? interval === "ANNUAL"
        ? { to: "MONTHLY" as const, label: "Renew monthly instead" }
        : sellsYearly({
              annualPrice: billing.annualPrice ?? renewing.annualPrice,
            })
          ? {
              to: "ANNUAL" as const,
              label: `Renew yearly instead${yearlySaving ? ` (${yearlySaving.toLowerCase()})` : ""}`,
            }
          : null
      : null;

  const hasScheduledChange =
    overview.status === "ACTIVE" &&
    (overview.cancelAtPeriodEnd || Boolean(pendingPlan));

  return (
    <Box>
      <SectionTitle title="Your plan" />

      <Flex align="center" gap="3" wrap="wrap">
        <Text fontSize="1.5rem" fontWeight="700" color="primary.500">
          {plan.name}
        </Text>
        <Badge
          size="md"
          bg={statusTone.bg}
          color={statusTone.color}
          borderWidth="1px"
          borderColor={statusTone.border}
        >
          {status.label}
        </Badge>
      </Flex>
      {isPaidPlan(plan) && (
        <Text fontSize="13px" color="gray.300" mt="0.5">
          {describePlanPrice(
            {
              ...plan,
              // The summary prices the plan that renews: this one, unless a
              // downgrade is scheduled.
              annualPrice:
                plan.annualPrice ?? (pendingPlan ? null : billing.annualPrice),
            },
            interval,
          )}
        </Text>
      )}

      <Stack gap="1" mt="3">
        {describePlanSummary(overview).map((line) => (
          <Text key={line} fontSize="14px" color="gray.400" lineHeight="1.6">
            {line}
          </Text>
        ))}
        {renewsOn && (
          <Text fontSize="14px" color="gray.500" lineHeight="1.6">
            Renews {renewsOn} — {describeRenewalPrice(overview)}
          </Text>
        )}
      </Stack>

      {intervalSwitch && (
        <Box mt="2">
          <Button
            variant="ghost"
            size="sm"
            px="0"
            py="1"
            h="auto"
            fontWeight="600"
            color="primary.300"
            loading={switchingInterval}
            onClick={() => switchInterval(intervalSwitch.to)}
          >
            {intervalSwitch.label}
          </Button>
          <Text fontSize="12px" color="gray.300">
            Only your next renewal changes. What you&rsquo;ve already paid for
            stays as it is.
          </Text>
        </Box>
      )}

      {hasScheduledChange && canManage && (
        <Button
          variant="outline"
          size="sm"
          mt="3"
          loading={resuming}
          onClick={() => resume()}
        >
          Keep my {plan.name} plan
        </Button>
      )}

      {activePromo && (
        <Box
          mt="4"
          p="3"
          rounded="lg"
          bg="secondary.50"
          borderWidth="1px"
          borderColor="secondary.100"
        >
          <Text fontSize="14px" color="gray.500">
            <Text as="span" fontWeight="700">
              Promo {activePromo.code}:
            </Text>{" "}
            {activePromo.description}
          </Text>
          {activePromo.remainingCycles > 0 && (
            <Text fontSize="12px" color="gray.400" mt="0.5">
              {activePromo.remainingCycles === 1
                ? "Your next payment is discounted."
                : `Your next ${activePromo.remainingCycles} payments are discounted.`}
            </Text>
          )}
        </Box>
      )}

      {due && (
        <Box
          mt="5"
          p={{ base: "4", md: "5" }}
          rounded="xl"
          bg={TONE_STYLES[due.tone].bg}
          borderWidth="1px"
          borderColor={TONE_STYLES[due.tone].border}
        >
          <Text fontSize="15px" fontWeight="600" color="gray.500">
            {due.message}
          </Text>
          {billing.promoDescription && (
            <Text fontSize="13px" color="gray.400" mt="1">
              Includes your promo: {billing.promoDescription}
            </Text>
          )}
          {canManage ? (
            <>
              <PayNowButton
                planTier={billing.renewalPlanTier}
                billingInterval={interval}
                mt="4"
                w={{ base: "full", sm: "auto" }}
                px="2.5rem"
              >
                Pay {formatPrice(billing.amountDue, billing.currency)} now
              </PayNowButton>
              <Text fontSize="12px" color="gray.400" mt="2">
                {PAYMENT_OPTIONS_NOTE}
              </Text>
            </>
          ) : (
            <Text fontSize="14px" color="gray.400" mt="2">
              {ASK_ADMIN_NOTE}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
