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
import type { LimitUsage, PlanFeature, PlanLimit } from "../api/types";
import { usePlanAccess } from "../hooks/usePlanAccess";
import { TONE_STYLES, type BillingTone } from "../utils/copy";

/** Used this much of a limit and we start showing the meter. */
const NEAR_CAP_RATIO = 0.8;

const LIMIT_NOUNS: Record<string, { one: string; many: string }> = {
  invoices: { one: "invoice", many: "invoices" },
  customers: { one: "customer", many: "customers" },
  users: { one: "user", many: "users" },
  jobCards: { one: "job card", many: "job cards" },
  inspections: { one: "inspection", many: "inspections" },
  paperwork: { one: "paperwork record", many: "paperwork records" },
};

/** Why each lockable feature is worth having, for the upgrade prompt. */
const FEATURE_PITCH: Record<string, string> = {
  reminders:
    "Reminders are on the Standard plan. Upgrade to schedule services, follow-ups and paperwork renewals, and keep the ones you have working.",
  businessStatement:
    "The business statement is on the Standard plan. Upgrade for your whole business on one page: money by account, sales, spending, profit and tax.",
  invoiceTerms:
    "Terms & conditions print on invoices on the Standard plan. Upgrade to add them.",
  defaultVat:
    "A default VAT on every new invoice is on the Standard plan. You can still pick a tax on each invoice.",
};

/** "12 of 15 invoices", "96 of 100 invoices this month". */
export function describeUsage(limit: PlanLimit, usage: LimitUsage) {
  const noun = LIMIT_NOUNS[limit];
  const name = noun ? (usage.limit === 1 ? noun.one : noun.many) : limit;
  const period = usage.per === "month" ? " this month" : "";
  return `${usage.used} of ${usage.limit} ${name}${period}`;
}

export function PlanBadge(props: BadgeProps) {
  return (
    <Badge size="sm" bg="secondary.50" color="primary.500" {...props}>
      Standard
    </Badge>
  );
}

export function UpgradeButton() {
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      flexShrink={0}
      onClick={() => navigate(RouteConstants.settings.billing.path)}
    >
      Upgrade
    </Button>
  );
}

function PlanNotice({
  tone,
  message,
  showUpgrade,
  ...rest
}: {
  tone: BillingTone;
  message: string;
  showUpgrade: boolean;
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
      <Text textStyle="small-regular" color="gray.500">
        {message}
      </Text>
      {showUpgrade && <UpgradeButton />}
    </Flex>
  );
}

/**
 * Shows a limit once it's close, so reaching it is no surprise. Renders nothing
 * below that, on a plan with no cap, or while the plan is unknown.
 */
export function PlanLimitNotice({
  limit,
  ...rest
}: { limit: PlanLimit } & FlexProps) {
  const { usageOf, isAtLimit, canUpgrade } = usePlanAccess();
  const usage = usageOf(limit);
  if (!usage || usage.limit === null) return null;

  const used = describeUsage(limit, usage);
  if (isAtLimit(limit)) {
    const next = canUpgrade
      ? "Upgrade to add more."
      : usage.per === "month"
        ? "More are available on the 1st."
        : "";
    return (
      <PlanNotice
        tone="warning"
        message={`You've used ${used}. ${next}`.trim()}
        showUpgrade={canUpgrade}
        {...rest}
      />
    );
  }
  if (usage.used < usage.limit * NEAR_CAP_RATIO) return null;
  return (
    <PlanNotice
      tone="neutral"
      message={`You've used ${used}.`}
      showUpgrade={canUpgrade}
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
  return (
    <PlanNotice
      tone="neutral"
      message={
        FEATURE_PITCH[feature] ??
        "This is on the Standard plan. Upgrade to use it."
      }
      showUpgrade
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
