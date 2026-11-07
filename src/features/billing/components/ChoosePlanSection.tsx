import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { CheckIcon } from "@/assets/custom/CheckIcon";
import ConsentDialog from "@/components/common/ConsentDialog";
import SectionLoader from "@/components/common/SectionLoader";
import { SectionTitle } from "@/features/settings/components/SectionTitle";
import {
  useBillingPlansQuery,
  useCancelSubscriptionMutation,
  useChangePlanMutation,
  useResumeSubscriptionMutation,
} from "../api/query";
import type { BillingOverview, BillingPlan, PlanTier } from "../api/types";
import { isInPaidPeriod, isPaidPlan } from "../utils/copy";
import { isTierAbove } from "../utils/tiers";
import { formatLongDate, formatPrice } from "../utils/format";
import { CheckoutPanel } from "./CheckoutPanel";

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
): PlanAction {
  const current = overview.plan;
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
      note: `You keep ${current.name} until ${end}, then switch to ${target.name} at ${formatPrice(target.monthlyPrice, target.currency)} a month. Nothing to pay today.`,
      buttonLabel: `Switch to ${target.name} on ${end}`,
    };
  }

  if (inPaidPeriod && target.tier === current.tier) {
    return {
      kind: "checkout",
      title: "Pay for another month",
      note: `Paying now adds another month after ${end}.`,
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

/** How many of a plan's rows show before "See more". */
const PREVIEW_ROWS = 4;

/**
 * What a plan includes, as the API words it. Never built up by hand here. What
 * exists comes first, so the preview never leads with something not built yet.
 */
function planRows(plan: BillingPlan) {
  const rows = [
    ...(plan.limits ?? []).map((row) => ({
      key: `limit-${row.key}`,
      text: row.phrase,
      comingSoon: row.comingSoon,
    })),
    ...(plan.features ?? [])
      .filter((row) => row.included)
      .map((row) => ({
        key: `feature-${row.key}`,
        text: row.label,
        comingSoon: row.comingSoon,
      })),
  ];
  return [
    ...rows.filter((row) => !row.comingSoon),
    ...rows.filter((row) => row.comingSoon),
  ];
}

interface PlanCardProps {
  plan: BillingPlan;
  selected: boolean;
  /** Worth drawing the eye to: an upgrade from the plan they're on. */
  highlighted: boolean;
  buttonLabel: string;
  buttonDisabled: boolean;
  onSelect: () => void;
  /** A second way in, for a plan whose main button is "Active plan". */
  renew?: () => void;
}

function PlanCard({
  plan,
  selected,
  highlighted,
  buttonLabel,
  buttonDisabled,
  onSelect,
  renew,
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rows = planRows(plan);
  const visible = expanded ? rows : rows.slice(0, PREVIEW_ROWS);

  return (
    <Flex
      direction="column"
      p="5"
      rounded="xl"
      borderWidth="1px"
      borderColor={selected || highlighted ? "primary.300" : "gray.75"}
      bg="white"
      shadow={selected || highlighted ? "sm" : "none"}
      transition="border-color .15s ease, box-shadow .15s ease"
    >
      <Flex align="center" justify="space-between" gap="2" minH="1.5rem">
        <Text fontSize="15px" fontWeight="600" color="gray.500">
          {plan.name}
        </Text>
        {highlighted && (
          <Badge size="sm" bg="primary.50" color="primary.500">
            Recommended
          </Badge>
        )}
      </Flex>

      <Flex align="baseline" gap="1" mt="2">
        <Text
          fontSize="1.75rem"
          lineHeight="1.2"
          fontWeight="700"
          color="primary.500"
        >
          {isPaidPlan(plan)
            ? formatPrice(plan.monthlyPrice, plan.currency)
            : "Free"}
        </Text>
        {isPaidPlan(plan) && (
          <Text fontSize="13px" color="gray.300">
            / month
          </Text>
        )}
      </Flex>

      {plan.description && (
        <Text fontSize="13px" color="gray.400" lineHeight="1.5" mt="2">
          {plan.description}
        </Text>
      )}

      {rows.length > 0 && (
        <Stack gap="2" mt="4" pt="4" borderTopWidth="1px" borderColor="gray.75">
          {visible.map((row) => (
            <Flex key={row.key} align="flex-start" gap="2">
              <CheckIcon
                boxSize="1rem"
                mt="0.125rem"
                flexShrink={0}
                color={row.comingSoon ? "gray.200" : "primary.300"}
              />
              <Text
                fontSize="13px"
                lineHeight="1.4"
                color={row.comingSoon ? "gray.300" : "gray.500"}
              >
                {row.text}
                {row.comingSoon && (
                  <Badge size="xs" variant="subtle" ml="2">
                    Coming soon
                  </Badge>
                )}
              </Text>
            </Flex>
          ))}
          {rows.length > PREVIEW_ROWS && (
            <Box>
              <Button
                variant="ghost"
                size="xs"
                px="0"
                color="primary.300"
                aria-expanded={expanded}
                onClick={() => setExpanded((open) => !open)}
              >
                {expanded ? "See less" : "See more"}
              </Button>
            </Box>
          )}
        </Stack>
      )}

      {/* Pushes the button down, so the cards' buttons line up. */}
      <Box flex="1" minH="4" />

      <Button
        w="full"
        size="sm"
        variant={highlighted && !selected ? "primary" : "outline"}
        disabled={buttonDisabled}
        aria-pressed={selected}
        onClick={onSelect}
      >
        {buttonLabel}
      </Button>
      {renew && (
        <Button
          variant="ghost"
          size="xs"
          mt="2"
          color="gray.400"
          onClick={renew}
        >
          Pay for another month
        </Button>
      )}
    </Flex>
  );
}

interface ChoosePlanSectionProps {
  overview: BillingOverview;
  canManage: boolean;
}

/** Plan picker: pay to upgrade/renew, or schedule a downgrade / Starter. */
export function ChoosePlanSection({
  overview,
  canManage,
}: ChoosePlanSectionProps) {
  const { data: plans, isLoading } = useBillingPlansQuery();
  const [selected, setSelected] = useState<PlanTier | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);

  const changePlan = useChangePlanMutation();
  const cancel = useCancelSubscriptionMutation();
  const resume = useResumeSubscriptionMutation();

  const sortedPlans = useMemo(
    () =>
      [...(plans ?? [])].sort(
        (a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice),
      ),
    [plans],
  );

  // On a phone the panel opens below every card, out of sight of the tap.
  const actionPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      actionPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selected]);

  const selectedPlan = sortedPlans.find((p) => p.tier === selected) ?? null;
  const action = selectedPlan ? planActionFor(selectedPlan, overview) : null;
  const inPaidPeriod = isInPaidPeriod(overview);
  const end = formatLongDate(overview.currentPeriodEnd);
  const lapsed =
    overview.status === "PAST_DUE" || overview.status === "EXPIRED";

  if (!canManage) {
    return (
      <Box>
        <SectionTitle title="Change plan" />
        <Text fontSize="14px" color="gray.400">
          Only your admin can change the plan or pay for it.
        </Text>
      </Box>
    );
  }

  // Switched off from the back office: they're on Starter whatever plan is on
  // file, and that plan needs paying for to come back.
  const switchedOff =
    overview.status === "CANCELLED" || overview.status === "INACTIVE";
  const isActivePlan = (plan: BillingPlan) =>
    switchedOff
      ? plan.tier === overview.effectiveTier
      : plan.tier === overview.plan.tier && !lapsed;

  const buttonLabelFor = (plan: BillingPlan) => {
    if (plan.tier === selected) return "Selected";
    if (isActivePlan(plan)) return "Active plan";
    if (plan.tier === overview.plan.tier) return "Renew plan";
    return planActionFor(plan, overview).kind === "scheduled"
      ? "Scheduled"
      : "Select plan";
  };

  return (
    <Box>
      <SectionTitle
        title={
          isPaidPlan(overview.plan)
            ? "Change or renew your plan"
            : "Upgrade your plan"
        }
        subtitle="Pick the plan that fits your business. You'll see what you'd pay before you pay anything."
      />

      {isLoading ? (
        <SectionLoader h="8rem" />
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            md: `repeat(${Math.max(1, Math.min(sortedPlans.length, 3))}, 1fr)`,
          }}
          gap="4"
        >
          {sortedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={plan.tier === selected}
              highlighted={isTierAbove(plan.tier, overview.effectiveTier)}
              buttonLabel={buttonLabelFor(plan)}
              buttonDisabled={isActivePlan(plan) && plan.tier !== selected}
              // Tapping the selected plan again closes its panel.
              onSelect={() =>
                setSelected((current) =>
                  current === plan.tier ? null : plan.tier,
                )
              }
              renew={
                isActivePlan(plan) && inPaidPeriod && plan.tier !== selected
                  ? () => setSelected(plan.tier)
                  : undefined
              }
            />
          ))}
        </Grid>
      )}

      {selectedPlan && action && (
        <Box mt="5" ref={actionPanelRef}>
          {action.kind === "current" && (
            <Text fontSize="14px" color="gray.400">
              You're already on this plan.
            </Text>
          )}

          {action.kind === "checkout" && (
            <CheckoutPanel
              key={selectedPlan.tier}
              plan={selectedPlan}
              title={action.title}
              note={action.note}
              hasCard={Boolean(overview.card)}
              onActivated={() => setSelected(null)}
            />
          )}

          {action.kind === "schedule" && (
            <Box
              p={{ base: "4", md: "5" }}
              rounded="xl"
              borderWidth="1px"
              borderColor="gray.75"
              bg="gray.50"
            >
              <Text fontSize="14px" color="gray.500" lineHeight="1.6">
                {action.note}
              </Text>
              <Button
                variant="primary"
                mt="4"
                w={{ base: "full", sm: "auto" }}
                loading={changePlan.isPending}
                onClick={() =>
                  changePlan.mutate(selectedPlan.tier, {
                    onSuccess: () => setSelected(null),
                  })
                }
              >
                {action.buttonLabel}
              </Button>
            </Box>
          )}

          {action.kind === "scheduled" && (
            <Box
              p={{ base: "4", md: "5" }}
              rounded="xl"
              borderWidth="1px"
              borderColor="gray.75"
              bg="gray.50"
            >
              <Text fontSize="14px" color="gray.500">
                {action.note}
              </Text>
              <Button
                variant="outline"
                size="sm"
                mt="3"
                loading={resume.isPending}
                onClick={() =>
                  resume.mutate(undefined, {
                    onSuccess: () => setSelected(null),
                  })
                }
              >
                Undo this change
              </Button>
            </Box>
          )}
        </Box>
      )}

      {inPaidPeriod && !overview.cancelAtPeriodEnd && (
        <Button
          variant="ghost"
          size="sm"
          px="0"
          py="1"
          h="auto"
          mt="5"
          color="gray.400"
          textDecoration="underline"
          onClick={() => setConfirmStop(true)}
        >
          Stop my plan from renewing
        </Button>
      )}

      <ConsentDialog
        open={confirmStop}
        onOpenChange={({ open }) => setConfirmStop(open)}
        variant="warning"
        heading={`Stop renewing your ${overview.plan.name} plan?`}
        note={`You keep ${overview.plan.name} until ${end}. After that you'll move to the free Starter plan. You can change your mind any time before then.`}
        confirmText="Yes, stop renewing"
        cancelText="Keep my plan"
        isLoading={cancel.isPending}
        handleSubmit={() =>
          cancel.mutate(undefined, {
            onSuccess: () => setConfirmStop(false),
          })
        }
      />
    </Box>
  );
}
