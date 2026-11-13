import { Box, Grid, Stack, Text } from "@chakra-ui/react";
import { SectionTitle } from "@/features/settings/components/SectionTitle";
import { useBillingPlansQuery } from "../api/query";
import type { BillingOverview, LimitUsage } from "../api/types";

function UsageMeter({ label, usage }: { label: string; usage: LimitUsage }) {
  const { used, limit, per } = usage;
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;
  const full = limit !== null && used >= limit;
  const barColor = full
    ? "error.300"
    : percent >= 80
      ? "warning.200"
      : "primary.300";

  return (
    <Box>
      <Stack
        direction="row"
        justify="space-between"
        align="baseline"
        gap="3"
        mb="1"
      >
        <Text fontSize="13px" fontWeight="500" color="gray.500">
          {label}
        </Text>
        <Text fontSize="12px" color={full ? "error.300" : "gray.400"}>
          {limit === null
            ? `${used.toLocaleString("en-NG")} (no limit)`
            : `${used.toLocaleString("en-NG")} of ${limit.toLocaleString("en-NG")}${per === "total" ? "" : ` this ${per}`}`}
        </Text>
      </Stack>
      <Box h="6px" rounded="full" bg="gray.75" overflow="hidden">
        <Box
          h="100%"
          w={`${percent}%`}
          bg={limit === null ? "transparent" : barColor}
        />
      </Box>
      {allowanceNote(usage, label) && (
        <Text fontSize="12px" color="gray.400" mt="1">
          {allowanceNote(usage, label)}
        </Text>
      )}
    </Box>
  );
}

/**
 * Under a start-then bar (Starter's invoices: 15, then 3 a month): what comes
 * after the start, or, once it is used, why the bar now counts the month.
 */
function allowanceNote(usage: LimitUsage, label: string): string | null {
  const { stage, then, startLimit } = usage;
  if (!stage || !then) return null;
  const every = `${then.max.toLocaleString("en-NG")} free every ${then.per}`;
  if (stage === "start") return `Then ${every}.`;
  const start = startLimit ? `${startLimit.toLocaleString("en-NG")} ` : "";
  return `Your ${start}free ${label.toLowerCase()} are used: now ${every}, more on ${then.per === "year" ? "1 January" : "the 1st"}.`;
}

/**
 * How much of the plan is used. Labels and what's built come from the plan
 * list; the numbers from the overview. Templates are left out: their allowance
 * is per document type, so one bar would mislead.
 */
export function PlanUsageSection({ overview }: { overview: BillingOverview }) {
  const { data: plans } = useBillingPlansQuery();
  const plan = plans?.find((p) => p.tier === overview.effectiveTier);

  const rows = (plan?.limits ?? []).flatMap((row) => {
    const usage = overview.limits?.[row.key];
    return usage && !row.comingSoon && row.key !== "templates"
      ? [{ key: row.key, label: row.label, usage }]
      : [];
  });
  if (!rows.length) return null;

  return (
    <Box>
      <SectionTitle
        title="What you've used"
        subtitle="What you already have is never removed. At a limit, you just can't add more."
      />
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        {rows.map((row) => (
          <UsageMeter key={row.key} label={row.label} usage={row.usage} />
        ))}
      </Grid>
    </Box>
  );
}
