import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  SegmentGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import {
  useBillingPlansQuery,
  useChangePlanMutation,
  useResumeSubscriptionMutation,
} from "../api/query";
import type {
  BillingInterval,
  BillingOverview,
  BillingPlan,
  PlanTier,
} from "../api/types";
import { isInPaidPeriod, isPaidPlan } from "../utils/copy";
import { isTierAbove } from "../utils/tiers";
import { formatLongDate, formatPrice } from "../utils/format";
import {
  describeAnnualSaving,
  describePlanPrice,
  intervalFor,
  renewalInterval,
  sellsYearly,
} from "../utils/interval";
import { BillingCard, CardBody, InfoTip } from "./BillingCard";
import { CheckoutPanel } from "./CheckoutPanel";
import { PlanComparison, limitCell } from "./PlanComparison";

type PlanAction =
  | { kind: "current" }
  | { kind: "checkout"; title: string; note: string }
  | { kind: "schedule"; note: string; buttonLabel: string }
  | { kind: "scheduled"; note: string };

/**
 * What picking `target` means for this org, mirroring the API: upgrades and
 * renewals are paid now; downgrades and Starter wait for the period to end.
 */
function planActionFor(
  target: BillingPlan,
  overview: BillingOverview,
  interval: BillingInterval,
): PlanAction {
  const current = overview.plan;
  const period = intervalFor(target, interval) === "ANNUAL" ? "year" : "month";
  const inPaidPeriod = isInPaidPeriod(overview);
  const end = formatLongDate(overview.currentPeriodEnd);

  if (!isPaidPlan(target)) {
    if (!isPaidPlan(current)) return { kind: "current" };
    if (inPaidPeriod) {
      if (overview.cancelAtPeriodEnd) {
        return {
          kind: "scheduled",
          note: `You'll move to the free Starter plan on ${end}.`,
        };
      }
      return {
        kind: "schedule",
        note: `You keep ${current.name} until ${end}. After that you'll move to the free Starter plan and won't be asked to pay.`,
        buttonLabel: `Move to Starter on ${end}`,
      };
    }
    return {
      kind: "schedule",
      note: "You'll move to the free Starter plan straight away and won't be asked to pay.",
      buttonLabel: "Move to Starter now",
    };
  }

  const isDowngrade =
    target.tier !== current.tier &&
    Number(target.monthlyPrice) < Number(current.monthlyPrice);

  if (inPaidPeriod && isDowngrade) {
    if (overview.pendingPlan?.tier === target.tier) {
      return {
        kind: "scheduled",
        note: `You'll switch to ${target.name} on ${end}.`,
      };
    }
    return {
      kind: "schedule",
      note: `You keep ${current.name} until ${end}, then switch to ${target.name} at ${describePlanPrice(target, renewalInterval(overview))}. Nothing to pay today.`,
      buttonLabel: `Switch to ${target.name} on ${end}`,
    };
  }

  if (inPaidPeriod && target.tier === current.tier) {
    return {
      kind: "checkout",
      title: `Pay for another ${period}`,
      note: `Paying now adds another ${period} after ${end}.`,
    };
  }

  if (inPaidPeriod) {
    return {
      kind: "checkout",
      title: `Upgrade to ${target.name}`,
      note: `Your ${target.name} plan starts as soon as you pay.`,
    };
  }

  return {
    kind: "checkout",
    title: `Pay for ${target.name}`,
    note: `Your ${target.name} plan starts as soon as you pay.`,
  };
}

interface PlanCardProps {
  plan: BillingPlan;
  interval: BillingInterval;
  selected: boolean;
  /** The plan they're on. */
  current: boolean;
  /** The next plan up from the one they're on. */
  recommended: boolean;
  /** Null: the card can't be picked (the plan they're on, or no rights). */
  onSelect: (() => void) | null;
}

/** A plan: price, what it's for, and its limits. Tap to pick it. */
function PlanCard({
  plan,
  interval,
  selected,
  current,
  recommended,
  onSelect,
}: PlanCardProps) {
  const yearly = intervalFor(plan, interval) === "ANNUAL";
  const saving = yearly ? describeAnnualSaving(plan, plan.currency) : null;
  const limits = (plan.limits ?? []).filter((row) => !row.comingSoon);

  return (
    <Box
      as={onSelect ? "button" : "div"}
      aria-pressed={onSelect ? selected : undefined}
      onClick={onSelect ?? undefined}
      position="relative"
      textAlign="left"
      w="full"
      p="5"
      rounded="xl"
      borderWidth="1px"
      borderColor={
        selected
          ? "primary.300"
          : current
            ? "rgba(4, 144, 32, 0.22)"
            : "gray.75"
      }
      outline={selected ? "1px solid" : undefined}
      outlineColor="primary.300"
      bg={current ? "rgba(4, 144, 32, 0.035)" : "white"}
      cursor={onSelect ? "pointer" : "default"}
      transition="border-color .15s ease, box-shadow .15s ease"
      _hover={
        onSelect && !selected ? { borderColor: "primary.100" } : undefined
      }
    >
      {recommended && (
        <Badge
          position="absolute"
          top="-0.7rem"
          right="4"
          bg="primary.300"
          color="white"
          rounded="full"
          px="2.5"
          size="sm"
        >
          Recommended
        </Badge>
      )}

      <Flex align="center" gap="2">
        <Text fontSize="15px" fontWeight="700" color="gray.500">
          {plan.name}
        </Text>
        {current && (
          <Badge
            size="sm"
            bg="success.50"
            color="success.400"
            rounded="full"
            px="2"
          >
            Current
          </Badge>
        )}
      </Flex>

      <Flex align="baseline" gap="0.5" mt="2">
        <Text
          fontSize="1.875rem"
          lineHeight="1.2"
          fontWeight="800"
          color="gray.500"
        >
          {formatPrice(
            isPaidPlan(plan)
              ? yearly
                ? plan.annualPrice
                : plan.monthlyPrice
              : 0,
            plan.currency,
          )}
        </Text>
        <Text fontSize="14px" color="gray.300">
          /{yearly ? "yr" : "mo"}
        </Text>
      </Flex>
      {saving ? (
        <Text fontSize="12px" color="success.400" fontWeight="600">
          {saving}
        </Text>
      ) : (
        interval === "ANNUAL" &&
        isPaidPlan(plan) && (
          <Text fontSize="12px" color="gray.300">
            Paid monthly only
          </Text>
        )
      )}
      {plan.description && (
        <Text
          fontSize="13px"
          color="gray.300"
          mt="1"
          lineHeight="1.5"
          lineClamp={2}
        >
          {plan.description}
        </Text>
      )}

      {limits.length > 0 && (
        <Stack gap="2" mt="4">
          {limits.map((row) => (
            <Flex key={row.key} justify="space-between" gap="3">
              <Text fontSize="14px" color="gray.400">
                {row.label}
              </Text>
              <Text
                fontSize="14px"
                fontWeight="600"
                color="gray.500"
                textAlign="right"
              >
                {limitCell(row)}
              </Text>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
}

interface ChoosePlanSectionProps {
  overview: BillingOverview;
  canManage: boolean;
}

/**
 * "Plans": pick one, see what it costs and pay (upgrade or renew), or schedule
 * a downgrade; then every plan side by side.
 */
export function ChoosePlanSection({
  overview,
  canManage,
}: ChoosePlanSectionProps) {
  const { data: plans, isLoading } = useBillingPlansQuery();
  // `?planTier=&billingInterval=` opens that plan's checkout: signup sends
  // people here when it couldn't start their payment itself.
  const [searchParams] = useSearchParams();
  const [picked, setPicked] = useState<PlanTier | null>(
    () => (searchParams.get("planTier") as PlanTier | null) || null,
  );
  // Starts on how they pay now, so a renewal is priced the way it'll be charged.
  const [interval, setBillingInterval] = useState<BillingInterval>(() => {
    const asked = searchParams.get("billingInterval");
    return asked === "ANNUAL" || asked === "MONTHLY"
      ? asked
      : renewalInterval(overview);
  });

  const changePlan = useChangePlanMutation();
  const resume = useResumeSubscriptionMutation();

  const sortedPlans = useMemo(
    () =>
      [...(plans ?? [])].sort(
        (a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice),
      ),
    [plans],
  );

  const lapsed =
    overview.status === "PAST_DUE" || overview.status === "EXPIRED";
  // Switched off from the back office: they're on Starter whatever plan is on
  // file, and that plan needs paying for to come back.
  const switchedOff =
    overview.status === "CANCELLED" || overview.status === "INACTIVE";
  const isActivePlan = (plan: BillingPlan) =>
    switchedOff
      ? plan.tier === overview.effectiveTier
      : plan.tier === overview.plan.tier && !lapsed;

  // Only the next plan up is "Recommended", and it's picked to begin with, so
  // there's always something to act on.
  const recommendedTier = sortedPlans.find((plan) =>
    isTierAbove(plan.tier, overview.effectiveTier),
  )?.tier;
  const selected = canManage ? (picked ?? recommendedTier ?? null) : null;

  // On a phone the action opens below every card, out of sight of the tap.
  const actionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picked) {
      actionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [picked, sortedPlans.length]);

  const anyYearly = sortedPlans.some(sellsYearly);
  const selectedPlan = sortedPlans.find((p) => p.tier === selected) ?? null;
  const action = selectedPlan
    ? planActionFor(selectedPlan, overview, interval)
    : null;
  const inPaidPeriod = isInPaidPeriod(overview);

  // As on the landing page: "Yearly · 2 months free" when that's true.
  const monthsFree = Math.max(
    0,
    ...sortedPlans.map((plan) =>
      sellsYearly(plan) ? (plan.annualMonthsFree ?? 0) : 0,
    ),
  );
  const intervalToggle = anyYearly ? (
    <SegmentGroup.Root
      value={interval}
      onValueChange={({ value }) =>
        value && setBillingInterval(value as BillingInterval)
      }
      bg="gray.50"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      p="1"
      gap="0"
      css={{ "--segment-indicator-shadow": "none" }}
    >
      <SegmentGroup.Indicator bg="primary.500" rounded="md" shadow="none" />
      <SegmentGroup.Items
        items={[
          { value: "MONTHLY", label: "Monthly" },
          {
            value: "ANNUAL",
            label: monthsFree ? `Yearly · ${monthsFree} months free` : "Yearly",
          },
        ]}
        px="4"
        py="2"
        h="auto"
        fontSize="14px"
        fontWeight="600"
        color="gray.400"
        cursor="pointer"
        _hover={{ color: "primary.500" }}
        _checked={{ color: "white", _hover: { color: "white" } }}
        css={{ "&::before": { display: "none" } }}
      />
    </SegmentGroup.Root>
  ) : null;

  return (
    <BillingCard
      id="plans"
      scrollMarginTop="6rem"
      title="Plans"
      subtitle={
        canManage
          ? "Prices in NGN. Pay by bank transfer, USSD or card, securely on Paystack."
          : "Prices in NGN. Only your admin can change the plan or pay for it."
      }
    >
      <CardBody>
        {intervalToggle && (
          <Flex align="center" gap="2" mb="6">
            {intervalToggle}
            <InfoTip label="What monthly and yearly mean">
              <Text fontWeight="600" mb="1">
                Monthly or yearly
              </Text>
              <Text>
                <b>Monthly:</b> you pay for one month at a time.
              </Text>
              <Text mt="1">
                <b>Yearly:</b> you pay for 12 months at once and it costs less
                than paying monthly. &ldquo;Months free&rdquo; is how much you
                save.
              </Text>
              <Text mt="1" color="gray.400">
                This only changes the prices shown here and what you&rsquo;d pay
                now. Starter is free either way.
              </Text>
            </InfoTip>
          </Flex>
        )}

        {isLoading ? (
          <SectionLoader h="12rem" />
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: `repeat(${Math.max(1, Math.min(sortedPlans.length, 3))}, 1fr)`,
            }}
            gap="4"
          >
            {sortedPlans.map((plan) => {
              const current = isActivePlan(plan);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  interval={interval}
                  selected={plan.tier === selected}
                  current={current}
                  recommended={plan.tier === recommendedTier}
                  onSelect={
                    canManage && (!current || inPaidPeriod)
                      ? () => setPicked(plan.tier)
                      : null
                  }
                />
              );
            })}
          </Grid>
        )}

        {canManage && (
          <Box
            ref={actionRef}
            mt="6"
            pt="6"
            borderTopWidth="1px"
            borderColor="gray.75"
          >
            <Box maxW="30rem" mx="auto">
              {!selectedPlan || !action ? (
                <Text fontSize="14px" color="gray.300" textAlign="center">
                  {isPaidPlan(overview.plan)
                    ? "You're on the top plan. Tap your plan to pay for another period."
                    : "Pick a plan above to see what you'd pay."}
                </Text>
              ) : action.kind === "current" ? (
                <Text fontSize="14px" color="gray.300" textAlign="center">
                  You're already on this plan.
                </Text>
              ) : action.kind === "checkout" ? (
                <CheckoutPanel
                  key={`${selectedPlan.tier}-${intervalFor(selectedPlan, interval)}`}
                  plan={selectedPlan}
                  interval={intervalFor(selectedPlan, interval)}
                  title={action.title}
                  note={action.note}
                  hasCard={Boolean(overview.card)}
                  onActivated={() => setPicked(null)}
                />
              ) : action.kind === "schedule" ? (
                <Stack align="center" textAlign="center" gap="3">
                  <Text fontSize="14px" color="gray.400" lineHeight="1.6">
                    {action.note}
                  </Text>
                  <Button
                    variant="primary"
                    loading={changePlan.isPending}
                    onClick={() =>
                      changePlan.mutate(selectedPlan.tier, {
                        onSuccess: () => setPicked(null),
                      })
                    }
                  >
                    {action.buttonLabel}
                  </Button>
                </Stack>
              ) : (
                <Stack align="center" textAlign="center" gap="3">
                  <Text fontSize="14px" color="gray.400">
                    {action.note}
                  </Text>
                  <Button
                    variant="outline"
                    color="gray.500"
                    size="sm"
                    loading={resume.isPending}
                    onClick={() =>
                      resume.mutate(undefined, {
                        onSuccess: () => setPicked(null),
                      })
                    }
                  >
                    Undo this change
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </CardBody>

      {!isLoading && sortedPlans.length > 0 && (
        <CardBody borderTopWidth="1px" borderColor="gray.75" pt="8" pb="8">
          <Text fontSize="20px" fontWeight="700" color="primary.500">
            Compare plans
          </Text>
          <Text fontSize="15px" color="gray.300" mt="1" mb="6">
            What each plan includes, side by side.
          </Text>
          <PlanComparison
            plans={sortedPlans}
            interval={interval}
            featuredTier={recommendedTier}
            isCurrent={isActivePlan}
            onChoose={
              canManage
                ? (plan) => {
                    setPicked(plan.tier);
                    actionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                : undefined
            }
          />
        </CardBody>
      )}
    </BillingCard>
  );
}
