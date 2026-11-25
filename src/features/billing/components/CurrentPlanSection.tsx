import { useState } from "react";
import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { SealCheck } from "@/assets/custom/SealCheck";
import ConsentDialog from "@/components/common/ConsentDialog";
import {
  useBillingIntervalMutation,
  useCancelSubscriptionMutation,
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
  isInPaidPeriod,
  isPaidPlan,
} from "../utils/copy";
import { formatLongDate, formatPrice } from "../utils/format";
import {
  describeAnnualSaving,
  describePlanPrice,
  renewalInterval,
  sellsYearly,
} from "../utils/interval";
import { BillingCard, CardBody, InfoTip } from "./BillingCard";
import { PayNowButton } from "./PayNowButton";
import { PlanUsageTiles } from "./PlanUsageSection";

interface CurrentPlanSectionProps {
  overview: BillingOverview;
  canManage: boolean;
}

/** "Your plan": the plan, where it stands, and how much of it is used. */
export function CurrentPlanSection({
  overview,
  canManage,
}: CurrentPlanSectionProps) {
  const { plan, pendingPlan, billing, activePromo } = overview;
  const [confirmStop, setConfirmStop] = useState(false);
  const resume = useResumeSubscriptionMutation();
  const cancel = useCancelSubscriptionMutation();
  const switchInterval = useBillingIntervalMutation();

  const status = describeStatus(overview);
  const statusTone = TONE_STYLES[status.tone];
  const due = describeDue(overview);
  const interval = renewalInterval(overview);
  const renewing = pendingPlan ?? plan;
  const end = formatLongDate(overview.currentPeriodEnd);

  // Switching only changes the next renewal, never what's already paid for.
  const yearlySaving = describeAnnualSaving(
    {
      annualSaving: billing.annualSaving ?? renewing.annualSaving,
      annualMonthsFree: renewing.annualMonthsFree,
    },
    renewing.currency,
  );
  // Only a saved card renewing by itself makes these mean anything. Without
  // one nothing is charged: they choose a month or a year when they pay
  // (Plans), and an unpaid plan simply ends.
  const autoRenewing = Boolean(overview.card) && overview.autoRenew;
  const intervalSwitch =
    canManage &&
    autoRenewing &&
    isPaidPlan(renewing) &&
    !overview.cancelAtPeriodEnd
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
  const canStopRenewing =
    canManage &&
    autoRenewing &&
    isInPaidPeriod(overview) &&
    !overview.cancelAtPeriodEnd;

  const price = isPaidPlan(plan)
    ? describePlanPrice(
        {
          ...plan,
          // The summary prices the plan that renews: this one, unless a
          // downgrade is scheduled.
          annualPrice:
            plan.annualPrice ?? (pendingPlan ? null : billing.annualPrice),
        },
        interval,
      )
    : "Free";

  return (
    <BillingCard
      title="Your plan"
      subtitle={describePlanSummary(overview).join(" ")}
    >
      <CardBody>
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap="4"
        >
          <Flex align="center" gap="3">
            <Flex
              align="center"
              justify="center"
              boxSize="3rem"
              rounded="xl"
              bg="primary.50"
              color="primary.300"
              flexShrink={0}
            >
              <SealCheck boxSize="1.5rem" />
            </Flex>
            <Box>
              <Flex align="center" gap="2" wrap="wrap">
                <Text fontSize="18px" fontWeight="700" color="gray.500">
                  {plan.name}
                </Text>
                <Badge
                  size="sm"
                  bg={statusTone.bg}
                  color={statusTone.color}
                  borderWidth="1px"
                  borderColor={statusTone.border}
                  rounded="full"
                  px="2"
                >
                  {status.label}
                </Badge>
              </Flex>
              <Text fontSize="14px" color="gray.300" mt="0.5">
                {plan.description || price}
              </Text>
            </Box>
          </Flex>

          {isPaidPlan(plan) && (
            <Box textAlign={{ base: "left", md: "right" }}>
              <Text fontSize="18px" fontWeight="700" color="gray.500">
                {price}
              </Text>
              {end && overview.status === "ACTIVE" && (
                <Text fontSize="13px" color="gray.300">
                  {overview.cancelAtPeriodEnd ? "Ends" : "Renews"} {end}
                </Text>
              )}
            </Box>
          )}
        </Flex>

        {due && (
          <Box
            mt="5"
            p="4"
            rounded="xl"
            bg={TONE_STYLES[due.tone].bg}
            borderWidth="1px"
            borderColor={TONE_STYLES[due.tone].border}
          >
            <Text fontSize="14px" fontWeight="600" color="gray.500">
              {due.message}
            </Text>
            {billing.promoDescription && (
              <Text fontSize="13px" color="gray.400" mt="1">
                Includes your promo: {billing.promoDescription}
              </Text>
            )}
            {canManage ? (
              <Flex align="center" gap="3" mt="3" wrap="wrap">
                <PayNowButton
                  planTier={billing.renewalPlanTier}
                  billingInterval={interval}
                  px="6"
                >
                  Pay {formatPrice(billing.amountDue, billing.currency)} now
                </PayNowButton>
                <Text fontSize="12px" color="gray.400">
                  {PAYMENT_OPTIONS_NOTE}
                </Text>
              </Flex>
            ) : (
              <Text fontSize="13px" color="gray.400" mt="1">
                {ASK_ADMIN_NOTE}
              </Text>
            )}
          </Box>
        )}

        {activePromo && (
          <Box
            mt="5"
            p="3"
            rounded="xl"
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

        <Box mt="5">
          <PlanUsageTiles overview={overview} />
        </Box>

        {(intervalSwitch ||
          (hasScheduledChange && canManage) ||
          canStopRenewing) && (
          <Stack
            direction={{ base: "column", sm: "row" }}
            gap={{ base: "2", sm: "5" }}
            mt="5"
            pt="4"
            borderTopWidth="1px"
            borderColor="gray.75"
            align={{ base: "flex-start", sm: "center" }}
          >
            {hasScheduledChange && canManage && (
              <Button
                variant="outline"
                color="gray.500"
                size="sm"
                loading={resume.isPending}
                onClick={() => resume.mutate()}
              >
                Keep my {plan.name} plan
              </Button>
            )}
            {intervalSwitch && (
              <Flex align="center" gap="1">
                <TextAction
                  loading={switchInterval.isPending}
                  onClick={() => switchInterval.mutate(intervalSwitch.to)}
                >
                  {intervalSwitch.label}
                </TextAction>
                <InfoTip label="What changing how you renew means">
                  <Text fontWeight="600" mb="1">
                    How your plan renews
                  </Text>
                  <Text>
                    You renew{" "}
                    <b>{interval === "ANNUAL" ? "yearly" : "monthly"}</b> now:{" "}
                    {interval === "ANNUAL"
                      ? "12 months are paid for at once."
                      : "you pay for one month at a time."}
                  </Text>
                  <Text mt="1">
                    {intervalSwitch.to === "ANNUAL"
                      ? "Switch to yearly and your next payment covers 12 months, for less than 12 monthly payments."
                      : "Switch to monthly and your next payment covers one month only."}
                  </Text>
                  <Text mt="1" color="gray.400">
                    Nothing is charged now, and what you&rsquo;ve already paid
                    for stays as it is. Only your next renewal changes.
                  </Text>
                </InfoTip>
              </Flex>
            )}
            {canStopRenewing && (
              <TextAction muted onClick={() => setConfirmStop(true)}>
                Stop my plan from renewing
              </TextAction>
            )}
          </Stack>
        )}
      </CardBody>

      <ConsentDialog
        open={confirmStop}
        onOpenChange={({ open }) => setConfirmStop(open)}
        variant="warning"
        heading={`Stop renewing your ${plan.name} plan?`}
        note={`You keep ${plan.name} until ${end}. After that you'll move to the free Starter plan. You can change your mind any time before then.`}
        confirmText="Yes, stop renewing"
        cancelText="Keep my plan"
        isLoading={cancel.isPending}
        handleSubmit={() =>
          cancel.mutate(undefined, {
            onSuccess: () => setConfirmStop(false),
          })
        }
      />
    </BillingCard>
  );
}

/** A small underlined text button. */
function TextAction({
  children,
  onClick,
  loading,
  muted = false,
}: {
  children: string;
  onClick: () => void;
  loading?: boolean;
  muted?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      px="0"
      h="auto"
      py="1"
      fontWeight="600"
      color={muted ? "gray.300" : "primary.300"}
      textDecoration="underline"
      loading={loading}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
