import { Children, useState, type ReactNode } from "react";
import { Center, Grid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsGrid } from "@/features/overview/components/dashboard/StatCardsGrid";
import {
  RevenueTrendChart,
  hasTrendLines,
} from "@/features/overview/components/dashboard/RevenueTrendChart";
import { InvoiceStatusChart } from "@/features/overview/components/dashboard/InvoiceStatusChart";
import { JobCardStatusChart } from "@/features/overview/components/dashboard/JobCardStatusChart";
import { TopDebtorsPanel } from "@/features/overview/components/dashboard/TopDebtorsPanel";
import { RecentJobCardsPanel } from "@/features/overview/components/dashboard/RecentJobCardsPanel";
import {
  DashboardFilters,
  DEFAULT_PRESET,
  getPresetFilter,
} from "@/features/overview/components/dashboard/DashboardFilters";
import { WhatsAppAssistantBanner } from "@/features/overview/components/dashboard/WhatsAppAssistantBanner";
import { UpcomingRemindersPanel } from "@/features/reminders/components/UpcomingRemindersPanel";
import { REMINDER_TYPES } from "@/shared/interface/reminder";
import { useGetCurrentUserQuery } from "@/features/auth/api";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetDashboardAnalyticsQuery } from "@/features/overview/api";
import type { DashboardAnalyticsFilter } from "@/features/overview/interface";

function formatPeriod(orgName: string, from?: string, to?: string): string {
  const fallback = `Financial overview for ${orgName}`;
  if (!from || !to) return fallback;
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const f = new Date(from);
  const t = new Date(to);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) {
    return fallback;
  }
  return `${f.toLocaleDateString("en-GB", opts)} — ${t.toLocaleDateString("en-GB", opts)}`;
}

/**
 * One row of dashboard panels. Hidden panels are left out by the caller, so a
 * lone panel takes the whole row and an empty row takes no space at all.
 */
function DashboardRow({
  columns,
  children,
}: {
  /** Columns when both panels show, e.g. "2fr 1fr". */
  columns: string;
  children: ReactNode;
}) {
  const panels = Children.toArray(children);
  if (panels.length === 0) return null;
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        lg: panels.length > 1 ? columns : "1fr",
      }}
      gap="4"
    >
      {panels}
    </Grid>
  );
}

export function OverviewTemplate() {
  const [filter, setFilter] = useState<DashboardAnalyticsFilter>(() =>
    getPresetFilter(DEFAULT_PRESET),
  );
  const { data, isLoading, isError } = useGetDashboardAnalyticsQuery(filter);
  const { data: user } = useGetCurrentUserQuery();
  const { canRead, can, canAccess } = usePermissions();
  const currency = data?.currency ?? "NGN";
  const orgName = user?.organization?.name ?? "your organization";

  // What this user's roles show (docs/frontend-permission-based-views.md, D7).
  // The API also leaves out what they can't see, so each panel needs both.
  const may = {
    invoices: canRead("invoices"),
    revenue: canRead("payments_received"),
    finance: can("finance"),
    customers: canRead("clients"),
    jobCards: canRead("job_cards"),
    reminders: canAccess("reminders"),
    paperwork: canAccess("paperwork") && canAccess("reminders"),
  };
  const trendLines = {
    collected: may.revenue,
    invoiced: may.invoices,
    expenses: may.finance,
    profit: may.finance,
  };
  const loading = isLoading || !data;
  const showTrend = loading
    ? may.revenue || may.invoices || may.finance
    : hasTrendLines(data.trend, trendLines);

  return (
    <Stack gap="6">
      <PageHeader
        title="Dashboard"
        subtitle={formatPeriod(orgName, data?.period?.from, data?.period?.to)}
        action={<DashboardFilters onChange={setFilter} />}
      />

      <WhatsAppAssistantBanner />

      {isError ? (
        <Center
          py="16"
          bg="white"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Text fontSize="14px" color="gray.400">
            We couldn&apos;t load your dashboard. Please try again.
          </Text>
        </Center>
      ) : (
        <>
          <StatCardsGrid
            summary={data?.summary}
            visible={may}
            currency={currency}
            isLoading={isLoading}
          />

          <DashboardRow columns="2fr 1fr">
            {may.invoices &&
              (loading ? (
                <Skeleton height="300px" rounded="xl" />
              ) : (
                data.topDebtors && (
                  <TopDebtorsPanel data={data.topDebtors} currency={currency} />
                )
              ))}
            {may.jobCards &&
              (loading ? (
                <Skeleton height="300px" rounded="xl" />
              ) : (
                data.jobCardStatusBreakdown && (
                  <JobCardStatusChart data={data.jobCardStatusBreakdown} />
                )
              ))}
          </DashboardRow>

          {/* Each panel fetches its own reminders, so an unrendered one never
              asks for what the user can't read. */}
          <DashboardRow columns="1fr 1fr">
            {may.paperwork && (
              <UpcomingRemindersPanel
                title="Paperwork due"
                subtitle="Next 5 documents expiring soon"
                type="PAPERWORK"
                withinDays={30}
                limit={5}
                showViewAll
                emptyText="No paperwork due soon"
              />
            )}
            {/* Every other reminder type — service, follow-ups, insurance and
                any custom ones. Paperwork is excluded: it has its own panel. */}
            {may.reminders && (
              <UpcomingRemindersPanel
                title="Reminders due"
                subtitle="Next 5 services, follow-ups and other reminders"
                excludeTypes={[REMINDER_TYPES.PAPERWORK]}
                withinDays={30}
                limit={5}
                showViewAll
                showType
                emptyText="No reminders due soon"
              />
            )}
          </DashboardRow>

          <DashboardRow columns="2fr 1fr">
            {showTrend &&
              (loading ? (
                <Skeleton height="340px" rounded="xl" />
              ) : (
                <RevenueTrendChart
                  data={data.trend}
                  visible={trendLines}
                  currency={currency}
                />
              ))}
            {may.invoices &&
              (loading ? (
                <Skeleton height="340px" rounded="xl" />
              ) : (
                data.invoiceStatusBreakdown && (
                  <InvoiceStatusChart data={data.invoiceStatusBreakdown} />
                )
              ))}
          </DashboardRow>

          {may.jobCards &&
            (loading ? (
              <Skeleton height="300px" rounded="xl" />
            ) : (
              data.recentJobCards && (
                <RecentJobCardsPanel data={data.recentJobCards} />
              )
            ))}
        </>
      )}
    </Stack>
  );
}
