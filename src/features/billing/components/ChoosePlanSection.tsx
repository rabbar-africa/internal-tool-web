import { useMemo, useState } from "react";
import { Badge, Box, Button, Grid, Stack, Text } from "@chakra-ui/react";
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

interface PlanOptionProps {
  plan: BillingPlan;
  tag?: string;
  selected: boolean;
  onSelect: () => void;
}

function PlanOption({ plan, tag, selected, onSelect }: PlanOptionProps) {
  return (
    <Box
      as="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      textAlign="left"
      p="4"
      rounded="xl"
      borderWidth="2px"
      borderColor={selected ? "primary.400" : "gray.75"}
      bg={selected ? "primary.50" : "white"}
      cursor="pointer"
      transition="border-color .15s ease, background .15s ease"
      _hover={{ borderColor: selected ? "primary.400" : "gray.100" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "primary.300" }}
      w="100%"
    >
      <Stack gap="1">
        <Box>
          <Text fontSize="16px" fontWeight="700" color="gray.500">
            {plan.name}
          </Text>
          {tag && (
            <Badge size="sm" bg="primary.100" color="primary.500" mt="1">
              {tag}
            </Badge>
          )}
        </Box>
        <Text fontSize="15px" fontWeight="600" color="primary.500">
          {isPaidPlan(plan)
            ? `${formatPrice(plan.monthlyPrice, plan.currency)} a month`
            : "Free"}
        </Text>
        {plan.description && (
          <Text fontSize="12px" color="gray.300" lineHeight="1.5">
            {plan.description}
          </Text>
        )}
      </Stack>
    </Box>
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

  const tagFor = (plan: BillingPlan) => {
    if (plan.tier !== overview.plan.tier) return undefined;
    return lapsed ? "Your last plan" : "Your plan";
  };

  return (
    <Box>
      <SectionTitle
        title={
          isPaidPlan(overview.plan)
            ? "Change or renew your plan"
            : "Upgrade your plan"
        }
        subtitle="Tap a plan to see what you'll pay."
      />

      {isLoading ? (
        <SectionLoader h="8rem" />
      ) : (
        <Grid
          role="radiogroup"
          aria-label="Plans"
          templateColumns={{
            base: "1fr",
            md: `repeat(${Math.max(1, Math.min(sortedPlans.length, 3))}, 1fr)`,
          }}
          gap="3"
        >
          {sortedPlans.map((plan) => (
            <PlanOption
              key={plan.id}
              plan={plan}
              tag={tagFor(plan)}
              selected={plan.tier === selected}
              onSelect={() => setSelected(plan.tier)}
            />
          ))}
        </Grid>
      )}

      {selectedPlan && action && (
        <Box mt="5">
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
