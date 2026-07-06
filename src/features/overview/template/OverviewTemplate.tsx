import { useState } from "react";
import { Center, Grid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsGrid } from "@/features/overview/components/dashboard/StatCardsGrid";
import { RevenueTrendChart } from "@/features/overview/components/dashboard/RevenueTrendChart";
import { InvoiceStatusChart } from "@/features/overview/components/dashboard/InvoiceStatusChart";
import { TopCustomersPanel } from "@/features/overview/components/dashboard/TopCustomersPanel";
import { TopDebtorsPanel } from "@/features/overview/components/dashboard/TopDebtorsPanel";
// import { RecentInvoicesPanel } from "@/features/overview/components/dashboard/RecentInvoicesPanel";
import {
  DashboardFilters,
  DEFAULT_PRESET,
  getPresetFilter,
} from "@/features/overview/components/dashboard/DashboardFilters";
import { UpcomingRemindersPanel } from "@/features/reminders/components/UpcomingRemindersPanel";
import { useGetCurrentUserQuery } from "@/features/auth/api";
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

export function OverviewTemplate() {
  const [filter, setFilter] = useState<DashboardAnalyticsFilter>(() =>
    getPresetFilter(DEFAULT_PRESET),
  );
  const { data, isLoading, isError } = useGetDashboardAnalyticsQuery(filter);
  const { data: user } = useGetCurrentUserQuery();
  const currency = data?.currency ?? "NGN";
  const orgName = user?.organization?.name ?? "your organization";

  return (
    <Stack gap="6">
      <PageHeader
        title="Dashboard"
        subtitle={formatPeriod(orgName, data?.period?.from, data?.period?.to)}
        action={<DashboardFilters onChange={setFilter} />}
      />

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
            currency={currency}
            isLoading={isLoading}
          />
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
            {isLoading || !data ? (
              <>
                <Skeleton height="260px" rounded="xl" />
                <Skeleton height="260px" rounded="xl" />
              </>
            ) : (
              <>
                <TopCustomersPanel
                  data={data.topCustomers}
                  currency={currency}
                />
                <TopDebtorsPanel data={data.topDebtors} currency={currency} />
              </>
            )}
          </Grid>
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
            <UpcomingRemindersPanel
              title="Paperwork due"
              subtitle="Next 5 documents expiring soon"
              type="PAPERWORK"
              withinDays={30}
              limit={5}
              showViewAll
              emptyText="No paperwork due soon"
            />
            <UpcomingRemindersPanel
              title="Service due"
              subtitle="Next 5 vehicles due for service"
              type="SERVICE"
              withinDays={30}
              limit={5}
              showViewAll
              emptyText="No services due soon"
            />
          </Grid>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="4">
            {isLoading || !data ? (
              <>
                <Skeleton height="340px" rounded="xl" />
                <Skeleton height="340px" rounded="xl" />
              </>
            ) : (
              <>
                <RevenueTrendChart
                  data={data.revenueTrend}
                  currency={currency}
                />
                <InvoiceStatusChart data={data.invoiceStatusBreakdown} />
              </>
            )}
          </Grid>
        </>
      )}
    </Stack>
  );
}
