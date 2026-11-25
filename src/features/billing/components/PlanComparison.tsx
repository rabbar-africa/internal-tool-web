import { Fragment, useState, type ReactNode } from "react";
import { Box, Button, Flex, Table, Text } from "@chakra-ui/react";
import { CheckIcon } from "@/assets/custom/CheckIcon";
import type {
  BillingInterval,
  BillingPlan,
  LimitPeriod,
  PlanLimitRow,
  PlanTier,
} from "../api/types";
import { isPaidPlan } from "../utils/copy";
import { formatPrice } from "../utils/format";
import { intervalFor } from "../utils/interval";

/*
 * The same table as the pricing page on the landing site
 * (rabbar-landing-page: components/pricing/ComparisonTable.tsx), with its copy
 * (data/pricing.ts). Keep the two alike.
 */

const count = (n: number) => n.toLocaleString("en-NG");

const perShort = (period: LimitPeriod | "month" | "year") =>
  period === "month" ? "/mo" : period === "year" ? "/yr" : "";

/** A limit on a plan card: "Unlimited", "100/mo", "15, then 3/mo". */
export function limitCell(row: PlanLimitRow | undefined) {
  if (!row) return "—";
  if (row.max === null) return "Unlimited";
  if (row.then) {
    return `${count(row.max)}, then ${count(row.then.max)}${perShort(row.then.per)}`;
  }
  return `${count(row.max)}${perShort(row.per)}`;
}

/** A limit in the table, as the landing page words it: "100 a month". */
function limitWords(row: PlanLimitRow | undefined) {
  if (!row) return "—";
  if (row.max === null) return "Unlimited";
  const n = count(row.max);
  if (row.key === "templates") return `${n} per document type`;
  if (row.per === "month") return `${n} a month`;
  if (row.per === "year") return `${n} a year`;
  if (row.then) return `${n}, then ${count(row.then.max)} a ${row.then.per}`;
  return n;
}

/** What every plan has: not a limit or a feature in the API. */
const EVERY_PLAN_INCLUDES = [
  {
    feature: "Invoices and receipts on WhatsApp",
    description: "Type the job in one message and get the PDF back",
  },
  {
    feature: "Digital job cards",
    description: "Status, technicians, promised date and profit per job",
  },
  {
    feature: "Vehicle inspection reports",
    description: "Checklist, photos and an AI-drafted advisory, as a PDF",
  },
  {
    feature: "Paperwork expiry tracking",
    description: "Insurance, vehicle licence, roadworthiness and more",
  },
  { feature: "Payments, expenses and profit" },
];

/** Friendlier names for some of the API's feature labels. */
const FEATURE_LABELS: Record<string, string> = {
  myNumbers: "Who owes you, and your numbers on WhatsApp",
  vatTracking: "VAT tracking and returns",
  reminders: "Service reminders",
};

/** Not worth a row (or repeated by another): as on the landing page. */
const HIDDEN_FEATURES = new Set([
  "webEditing",
  "noRabbarBranding",
  "vatReturns",
  "dailyRecurringExpenses",
]);

type Cell = boolean | string;

interface Row {
  feature: string;
  description?: string;
  values: Cell[];
}

/** Recommended column: the logo's lime, faint. */
const FEATURED_BG = "rgba(218, 230, 72, 0.15)";

function CellValue({ value, featured }: { value: Cell; featured: boolean }) {
  if (value === true) {
    return (
      <CheckIcon
        boxSize="1.15rem"
        color={featured ? "primary.300" : "success.100"}
        aria-label="Included"
      />
    );
  }
  if (value === false) {
    return (
      <Box
        w="0.75rem"
        h="2px"
        rounded="full"
        bg="gray.100"
        my="2"
        aria-label="Not included"
        role="img"
      />
    );
  }
  return (
    <Text fontSize="14px" fontWeight="500" color="primary.500">
      {value}
    </Text>
  );
}

function buildGroups(plans: BillingPlan[]) {
  const limits = new Map<string, string>();
  const features = new Map<string, string>();
  for (const plan of plans) {
    for (const row of plan.limits ?? []) {
      if (!row.comingSoon && !limits.has(row.key)) {
        limits.set(row.key, row.label);
      }
    }
    for (const row of plan.features ?? []) {
      if (
        !row.comingSoon &&
        !HIDDEN_FEATURES.has(row.key) &&
        !features.has(row.key)
      ) {
        features.set(row.key, FEATURE_LABELS[row.key] ?? row.label);
      }
    }
  }

  const groups: { group: string; rows: Row[] }[] = [
    {
      group: "In every plan",
      rows: EVERY_PLAN_INCLUDES.map(({ feature, description }) => ({
        feature,
        description,
        values: plans.map(() => true),
      })),
    },
    {
      group: "Limits",
      rows: [...limits].map(([key, label]) => ({
        feature: label,
        values: plans.map((plan) =>
          limitWords(plan.limits?.find((row) => row.key === key)),
        ),
      })),
    },
    {
      group: "Features",
      rows: [...features].map(([key, label]) => ({
        feature: label,
        values: plans.map(
          (plan) =>
            plan.features?.find((row) => row.key === key)?.included ?? false,
        ),
      })),
    },
  ];
  return groups.filter((group) => group.rows.length > 0);
}

interface PlanComparisonProps {
  plans: BillingPlan[];
  interval: BillingInterval;
  /** The tinted column: the plan we suggest. */
  featuredTier?: PlanTier;
  /** The plan they're on: its button says so. */
  isCurrent: (plan: BillingPlan) => boolean;
  /** Picks a plan for the checkout above; leave out for those who can't pay. */
  onChoose?: (plan: BillingPlan) => void;
}

/**
 * Every plan, feature by feature. On phones there isn't room for every
 * column, so a picker shows one plan at a time beside the feature names.
 */
export function PlanComparison({
  plans,
  interval,
  featuredTier,
  isCurrent,
  onChoose,
}: PlanComparisonProps) {
  const featuredIndex = plans.findIndex((plan) => plan.tier === featuredTier);
  const [shown, setShown] = useState(Math.max(0, featuredIndex));
  const groups = buildGroups(plans);
  if (!plans.length) return null;

  const column = (index: number) => ({
    display: {
      base: index === shown ? "table-cell" : "none",
      md: "table-cell",
    },
    bg: index === featuredIndex ? FEATURED_BG : undefined,
  });

  const header: ReactNode = (
    <Table.Row>
      <Table.ColumnHeader
        w={{ base: "58%", md: "28%" }}
        py="4"
        pr="4"
        borderBottomWidth="1px"
        borderColor="gray.75"
        bg="white"
      >
        <Text srOnly>Feature</Text>
      </Table.ColumnHeader>
      {plans.map((plan, index) => {
        const yearly = intervalFor(plan, interval) === "ANNUAL";
        const current = isCurrent(plan);
        return (
          <Table.ColumnHeader
            key={plan.tier}
            {...column(index)}
            bg={index === featuredIndex ? FEATURED_BG : "white"}
            roundedTop={index === featuredIndex ? "xl" : undefined}
            px="2"
            py="4"
            textAlign="center"
            verticalAlign="bottom"
            borderBottomWidth="1px"
            borderColor="gray.75"
          >
            <Text fontSize="16px" fontWeight="600" color="primary.500">
              {plan.name}
            </Text>
            <Text fontSize="14px" color="gray.300" mt="1" fontWeight="400">
              {isPaidPlan(plan)
                ? `${formatPrice(
                    yearly ? plan.annualPrice : plan.monthlyPrice,
                    plan.currency,
                  )}/${yearly ? "year" : "month"}`
                : "Free"}
            </Text>
            {onChoose && (
              <Button
                size="sm"
                mt="3"
                px="3"
                variant={
                  index === featuredIndex && !current ? "primary" : "outline"
                }
                color={
                  index === featuredIndex && !current
                    ? undefined
                    : "primary.500"
                }
                disabled={current}
                onClick={() => onChoose(plan)}
              >
                {current ? "Your plan" : "Choose"}
              </Button>
            )}
          </Table.ColumnHeader>
        );
      })}
    </Table.Row>
  );

  return (
    <Box>
      {/* Plan picker, phones only */}
      <Flex
        display={{ base: "flex", md: "none" }}
        mb="6"
        gap="1"
        overflowX="auto"
        rounded="lg"
        borderWidth="1px"
        borderColor="gray.75"
        bg="gray.50"
        p="1"
        role="group"
        aria-label="Choose a plan to compare"
      >
        {plans.map((plan, index) => (
          <Box
            as="button"
            key={plan.tier}
            onClick={() => setShown(index)}
            aria-pressed={shown === index}
            flexShrink={0}
            rounded="md"
            px="3"
            py="2"
            fontSize="14px"
            fontWeight="600"
            cursor="pointer"
            bg={shown === index ? "primary.500" : "transparent"}
            color={shown === index ? "white" : "gray.400"}
          >
            {plan.name}
          </Box>
        ))}
      </Flex>

      <Table.Root
        w="full"
        tableLayout="auto"
        css={{ borderCollapse: "collapse" }}
      >
        <Table.Caption srOnly>What each Rabbar plan includes</Table.Caption>
        <Table.Header>{header}</Table.Header>
        <Table.Body>
          {groups.map(({ group, rows }) => (
            <Fragment key={group}>
              <Table.Row bg="transparent">
                <Table.Cell
                  colSpan={plans.length + 1}
                  pt="10"
                  pb="3"
                  px="0"
                  borderBottomWidth="0"
                >
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="primary.300"
                  >
                    {group}
                  </Text>
                </Table.Cell>
              </Table.Row>
              {rows.map((row) => (
                <Table.Row
                  key={row.feature}
                  bg="transparent"
                  borderTopWidth="1px"
                  borderColor="gray.75"
                >
                  <Table.Cell
                    py="4"
                    pr="4"
                    pl="0"
                    verticalAlign="top"
                    borderBottomWidth="0"
                  >
                    <Text fontSize="15px" fontWeight="600" color="primary.500">
                      {row.feature}
                    </Text>
                    {row.description && (
                      <Text fontSize="14px" color="gray.300" mt="0.5">
                        {row.description}
                      </Text>
                    )}
                  </Table.Cell>
                  {row.values.map((value, index) => (
                    <Table.Cell
                      key={plans[index].tier}
                      {...column(index)}
                      px="2"
                      py="4"
                      textAlign="center"
                      verticalAlign="top"
                      borderBottomWidth="0"
                    >
                      <Flex justify="center">
                        <CellValue
                          value={value}
                          featured={index === featuredIndex}
                        />
                      </Flex>
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
