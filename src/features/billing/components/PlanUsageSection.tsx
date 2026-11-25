import { Flex, Grid, Text } from "@chakra-ui/react";
import { useBillingPlansQuery } from "../api/query";
import type { BillingOverview, LimitUsage } from "../api/types";
import { MeterBar } from "./BillingCard";

const count = (n: number) => n.toLocaleString("en-NG");

/** " this month", " this year", or nothing for a running total. */
const perPhrase = (per: LimitUsage["per"]) =>
  per === "total" ? "" : ` this ${per}`;

/**
 * Under a start-then meter (Starter's invoices: 15, then 3 a month): what comes
 * after the start, or, once it is used, that the meter now counts the month.
 */
function allowanceNote(usage: LimitUsage): string | null {
  const { stage, then } = usage;
  if (!stage || !then) return null;
  return stage === "start"
    ? `Then ${count(then.max)} every ${then.per}`
    : `Resets ${then.per === "year" ? "1 January" : "on the 1st"}`;
}

function UsageTile({ label, usage }: { label: string; usage: LimitUsage }) {
  const { used, limit, per } = usage;
  const unlimited = limit === null;
  const percent = limit ? (used / limit) * 100 : 0;
  const full = !unlimited && used >= (limit ?? 0);
  const color = full
    ? "error.100"
    : percent >= 80
      ? "warning.200"
      : "success.100";
  const note = full ? "Limit reached" : allowanceNote(usage);

  return (
    <Flex
      direction="column"
      gap="2"
      p="4"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
    >
      <Text fontSize="13px" color="gray.300">
        {label}
      </Text>
      <Text fontSize="15px" color="gray.400">
        <Text as="span" fontWeight="700" color="gray.500">
          {count(used)}
        </Text>{" "}
        {unlimited ? "· no limit" : `of ${count(limit ?? 0)}${perPhrase(per)}`}
      </Text>
      <MeterBar percent={unlimited ? 0 : percent} color={color} />
      {note && (
        <Text fontSize="12px" color={full ? "error.200" : "gray.300"}>
          {note}
        </Text>
      )}
    </Flex>
  );
}

/**
 * How much of the plan is used, one tile per limit. Labels come from the plan
 * list (a label is the same on every plan), the numbers from the overview.
 * Templates are left out: their allowance is per document type, so one meter
 * would mislead.
 */
export function PlanUsageTiles({ overview }: { overview: BillingOverview }) {
  const { data: plans } = useBillingPlansQuery();

  const labels = new Map<string, { label: string; comingSoon: boolean }>();
  for (const plan of plans ?? []) {
    for (const row of plan.limits ?? []) {
      if (!labels.has(row.key)) labels.set(row.key, row);
    }
  }
  const rows = [...labels].flatMap(([key, { label, comingSoon }]) => {
    const usage = overview.limits?.[key];
    return usage && !comingSoon && key !== "templates"
      ? [{ key, label, usage }]
      : [];
  });
  if (!rows.length) return null;

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap="3"
    >
      {rows.map((row) => (
        <UsageTile key={row.key} label={row.label} usage={row.usage} />
      ))}
    </Grid>
  );
}
