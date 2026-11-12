import type { ReactNode } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Stack,
  Text,
  type BadgeProps,
  type FlexProps,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { PlanFeature, PlanLimit } from "../api/types";
import { usePlanAccess } from "../hooks/usePlanAccess";
import { useFeatureUpgrade, useLimitUpgrade } from "../hooks/useUpgradePlan";
import { TONE_STYLES, type BillingTone } from "../utils/copy";
import { formatPrice } from "../utils/format";

/** Used this much of a limit and we start showing the meter. */
const NEAR_CAP_RATIO = 0.8;

const LIMIT_COPY: Record<string, { one: string; many: string; why: string }> = {
  invoices: {
    one: "invoice",
    many: "invoices",
    why: "so you can keep billing customers without stopping",
  },
  customers: {
    one: "customer",
    many: "customers",
    why: "so every new customer goes straight into your records",
  },
  users: {
    one: "user",
    many: "users",
    why: "so your whole team can work in one place",
  },
  jobCards: {
    one: "job card",
    many: "job cards",
    why: "so every car that comes in gets tracked",
  },
  inspections: {
    one: "inspection",
    many: "inspections",
    why: "so you can keep sending reports to customers",
  },
  paperwork: {
    one: "paperwork record",
    many: "paperwork records",
    why: "so no document's expiry catches you out",
  },
};

/** The case for each lockable feature; `plan` is whichever plan unlocks it. */
const FEATURE_PITCH: Record<
  string,
  { title: string; body: (plan: string) => string }
> = {
  customerStatement: {
    title: "Send customers their full history in one PDF.",
    body: (plan) =>
      `Upgrade to ${plan} to download a customer's work history and statement.`,
  },
  reminders: {
    title: "Bring customers back on time.",
    body: (plan) =>
      `Upgrade to ${plan} to schedule services, follow-ups and paperwork renewals.`,
  },
  businessStatement: {
    title: "See your whole business on one page.",
    body: (plan) =>
      `Upgrade to ${plan} for money by account, sales, spending, profit and tax, ready to download or send to your accountant.`,
  },
  invoiceTerms: {
    title: "Protect your business with your own terms.",
    body: (plan) =>
      `Upgrade to ${plan} to print terms & conditions on your invoices.`,
  },
  recurringExpenses: {
    title: "Record rent, salaries and other regular costs automatically.",
    body: (plan) =>
      `Upgrade to ${plan} to set a cost up once and have it recorded on every date it's due.`,
  },
  defaultVat: {
    title: "Stop adding VAT by hand.",
    body: (plan) =>
      `Upgrade to ${plan} and it goes on every new invoice for you. You can still pick a tax on each invoice.`,
  },
};

/** The plan a locked item needs. Nothing when no plan on sale includes it. */
export function PlanBadge({
  feature,
  ...props
}: { feature: PlanFeature } & BadgeProps) {
  const { plan, isAvailable } = useFeatureUpgrade(feature);
  if (!isAvailable) return null;
  return (
    <Badge size="sm" bg="secondary.50" color="primary.500" {...props}>
      {plan?.name ?? "Upgrade"}
    </Badge>
  );
}

export function UpgradeButton({ label = "Upgrade" }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      flexShrink={0}
      onClick={() => navigate(RouteConstants.settings.billing.path)}
    >
      {label}
    </Button>
  );
}

function PlanNotice({
  tone,
  title,
  body,
  upgradeLabel,
  ...rest
}: {
  tone: BillingTone;
  title: string;
  body?: string;
  /** Left out where upgrading wouldn't help. */
  upgradeLabel?: string;
} & FlexProps) {
  const style = TONE_STYLES[tone];
  return (
    <Flex
      role="status"
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      gap="3"
      px="4"
      py="3"
      rounded="lg"
      bg={style.bg}
      borderWidth="1px"
      borderColor={style.border}
      {...rest}
    >
      <Box>
        <Text textStyle="small-semibold" color="gray.500">
          {title}
        </Text>
        {body && (
          <Text textStyle="small-regular" color="gray.400" mt="0.5">
            {body}
          </Text>
        )}
      </Box>
      {upgradeLabel && <UpgradeButton label={upgradeLabel} />}
    </Flex>
  );
}

/**
 * Shows a limit once it's close, and makes the case for upgrading while there's
 * still something to gain. Renders nothing below that, on a plan with no cap,
 * or while the plan is unknown. Figures come from the API, never from here.
 */
export function PlanLimitNotice({
  limit,
  ...rest
}: { limit: PlanLimit } & FlexProps) {
  const { usageOf, isAtLimit, isOnFreePlan } = usePlanAccess();
  const usage = usageOf(limit);
  const atLimit = isAtLimit(limit);
  // Only fetch the plans once the notice is actually going to show.
  const isShowing =
    !!usage &&
    usage.limit !== null &&
    (atLimit || usage.used >= usage.limit * NEAR_CAP_RATIO);
  const { plan: upgradePlan, isAvailable: canUpgrade } = useLimitUpgrade(
    limit,
    usage?.limit,
    isShowing,
  );
  if (!usage || usage.limit === null) return null;

  if (!isShowing) return null;

  const copy = LIMIT_COPY[limit];
  const nameOf = (count: number) =>
    copy ? (count === 1 ? copy.one : copy.many) : limit;
  const resets = usage.per !== "total";
  const where = resets
    ? `this ${usage.per}`
    : isOnFreePlan
      ? "on your free plan"
      : "on your plan";

  let title: string;
  if (!atLimit) {
    const left = usage.remaining ?? 0;
    title = `Only ${left} ${nameOf(left)} left ${where}.`;
  } else if (usage.limit === 1) {
    title = `Your plan includes just 1 ${nameOf(1)}, and it's in use.`;
  } else {
    title = `You've used all ${usage.limit.toLocaleString("en-NG")} ${nameOf(usage.limit)} ${where}.`;
  }

  // A monthly or yearly allowance comes back by itself, whatever else is on offer.
  const refill =
    usage.per === "month"
      ? "More are available on the 1st."
      : usage.per === "year"
        ? "More are available on 1 January."
        : undefined;
  // Starter's invoices: 15, then 3 a month. Say so before the 15 run out.
  const after =
    usage.stage === "start" && usage.then
      ? `After that, ${usage.then.max.toLocaleString("en-NG")} free every ${usage.then.per}.`
      : undefined;
  let body = [after, refill].filter(Boolean).join(" ") || undefined;
  if (canUpgrade) {
    const phrase = upgradePlan?.limits?.find(
      (row) => row.key === limit,
    )?.phrase;
    const why = copy?.why ? ` ${copy.why}` : "";
    // The API's phrase can start "Unlimited", which reads wrong mid-sentence.
    const lowerPhrase = phrase && phrase[0].toLowerCase() + phrase.slice(1);
    const pitch =
      upgradePlan && phrase
        ? `${upgradePlan.name} gives you ${lowerPhrase}${why}, all for ${formatPrice(upgradePlan.monthlyPrice, upgradePlan.currency)} a month.`
        : `Upgrade${why}.`;
    body = body ? `${body} ${pitch}` : pitch;
  }

  return (
    <PlanNotice
      tone={atLimit ? "warning" : "neutral"}
      title={title}
      body={body}
      upgradeLabel={
        canUpgrade
          ? upgradePlan
            ? `Upgrade to ${upgradePlan.name}`
            : "Upgrade"
          : undefined
      }
      {...rest}
    />
  );
}

/** Explains a locked feature and offers the upgrade. Nothing if it's included. */
export function PlanFeatureNotice({
  feature,
  ...rest
}: { feature: PlanFeature } & FlexProps) {
  const { hasFeature } = usePlanAccess();
  const isLocked = !hasFeature(feature);
  const { plan, isAvailable } = useFeatureUpgrade(feature, isLocked);
  if (!isLocked) return null;

  const pitch = FEATURE_PITCH[feature];
  // No plan on sale includes it, so there is nothing to offer.
  if (!isAvailable) {
    return (
      <PlanNotice
        tone="neutral"
        title={pitch?.title ?? "This isn't on your plan."}
        body={pitch ? "This isn't on your plan." : undefined}
        {...rest}
      />
    );
  }
  const planName = plan?.name ?? "a higher plan";
  return (
    <PlanNotice
      tone="neutral"
      title={
        pitch?.title ??
        `This is on ${plan ? `the ${plan.name} plan` : planName}.`
      }
      body={pitch?.body(planName) ?? "Upgrade to use it."}
      upgradeLabel={plan ? `Upgrade to ${plan.name}` : "Upgrade"}
      {...rest}
    />
  );
}

/** Replaces a page or form the plan won't let them use, with a way back. */
function BlockedPage({ notice }: { notice: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Center py="12">
      <Stack gap="4" maxW="36rem" w="100%">
        {notice}
        <Box>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Box>
      </Stack>
    </Center>
  );
}

/** For a create page: at the limit, say so before they fill the form in. */
export function PlanLimitGate({
  limit,
  children,
}: {
  limit: PlanLimit;
  children: ReactNode;
}) {
  const { isAtLimit } = usePlanAccess();
  if (isAtLimit(limit)) {
    return <BlockedPage notice={<PlanLimitNotice limit={limit} />} />;
  }
  return <>{children}</>;
}

/** For a page that only works with a feature. */
export function PlanFeatureGate({
  feature,
  children,
}: {
  feature: PlanFeature;
  children: ReactNode;
}) {
  const { hasFeature } = usePlanAccess();
  if (!hasFeature(feature)) {
    return <BlockedPage notice={<PlanFeatureNotice feature={feature} />} />;
  }
  return <>{children}</>;
}
