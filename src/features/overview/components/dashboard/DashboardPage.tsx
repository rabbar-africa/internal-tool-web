import { Center, Grid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsGrid } from "./StatCardsGrid";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { InvoiceStatusChart } from "./InvoiceStatusChart";
import { TopCustomersPanel } from "./TopCustomersPanel";
import { RecentInvoicesPanel } from "./RecentInvoicesPanel";
import { useGetCurrentUserQuery } from "@/features/auth/api";
import { useGetDashboardAnalyticsQuery } from "../../api";

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

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardAnalyticsQuery();
  const { data: user } = useGetCurrentUserQuery();
  const currency = data?.currency ?? "NGN";
  const orgName = user?.organization?.name ?? "your organization";

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Dashboard"
          subtitle={formatPeriod(orgName, data?.period?.from, data?.period?.to)}
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
                  <RecentInvoicesPanel
                    data={data.recentInvoices}
                    currency={currency}
                  />
                </>
              )}
            </Grid>
          </>
        )}
      </Stack>
    </UserDashboardContainer>
  );
}
