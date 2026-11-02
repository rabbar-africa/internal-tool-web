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
import { useBillingPlansQuery } from "../api/query";
import type { PlanFeature, PlanLimit } from "../api/types";
import { usePlanAccess } from "../hooks/usePlanAccess";
import { TONE_STYLES, isPaidPlan, type BillingTone } from "../utils/copy";
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

/** The case for each lockable feature, for the upgrade prompt. */
const FEATURE_PITCH: Record<string, { title: string; body: string }> = {
  reminders: {
    title: "Bring customers back on time.",
    body: "Upgrade to Standard to schedule services, follow-ups and paperwork renewals.",
  },
  businessStatement: {
    title: "See your whole business on one page.",
    body: "Upgrade to Standard for money by account, sales, spending, profit and tax, ready to download or send to your accountant.",
  },
  invoiceTerms: {
    title: "Protect your business with your own terms.",
    body: "Upgrade to Standard to print terms & conditions on your invoices.",
  },
  defaultVat: {
    title: "Stop adding VAT by hand.",
    body: "Upgrade to Standard and it goes on every new invoice for you. You can still pick a tax on each invoice.",
  },
};

/** The cheapest paid plan, to quote its real allowance and price. */
function useUpgradePlan(enabled: boolean) {
  const { data: plans } = useBillingPlansQuery({ enabled });
  return [...(plans ?? [])]
    .filter((plan) => isPaidPlan(plan))
    .sort((a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice))[0];
}

export function PlanBadge(props: BadgeProps) {
  return (
    <Badge size="sm" bg="secondary.50" color="primary.500" {...props}>
      Standard
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
  const { usageOf, isAtLimit, canUpgrade } = usePlanAccess();
  const upgradePlan = useUpgradePlan(canUpgrade);
  const usage = usageOf(limit);
  if (!usage || usage.limit === null) return null;

  const atLimit = isAtLimit(limit);
  if (!atLimit && usage.used < usage.limit * NEAR_CAP_RATIO) return null;

  const copy = LIMIT_COPY[limit];
  const nameOf = (count: number) =>
    copy ? (count === 1 ? copy.one : copy.many) : limit;
  const monthly = usage.per === "month";
  const where = monthly
    ? "this month"
    : canUpgrade
      ? "on your free plan"
      : "on your plan";

  let title: string;
  if (!atLimit) {
    const left = usage.remaining ?? 0;
    title = `Only ${left} ${nameOf(left)} left ${where}.`;
  } else if (usage.limit === 1) {
    title = `Your plan includes just 1 ${nameOf(1)}, and it's in use.`;
  } else {
    title = `You've used all ${usage.limit} ${nameOf(usage.limit)} ${where}.`;
  }

  let body: string | undefined;
  if (canUpgrade) {
    const phrase = upgradePlan?.limits?.find(
      (row) => row.key === limit,
    )?.phrase;
    const why = copy?.why ? ` ${copy.why}` : "";
    body =
      upgradePlan && phrase
        ? `${upgradePlan.name} gives you ${phrase}${why}, all for ${formatPrice(upgradePlan.monthlyPrice, upgradePlan.currency)} a month.`
        : `Upgrade${why}.`;
  } else if (monthly) {
    body = "More are available on the 1st.";
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
  if (hasFeature(feature)) return null;
  const pitch = FEATURE_PITCH[feature] ?? {
    title: "This is on the Standard plan.",
    body: "Upgrade to use it.",
  };
  return (
    <PlanNotice
      tone="neutral"
      title={pitch.title}
      body={pitch.body}
      upgradeLabel="Upgrade"
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
