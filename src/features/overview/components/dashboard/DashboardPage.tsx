import { Grid, Stack } from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsGrid } from "./StatCardsGrid";
import { RevenueExpenseChart } from "./RevenueExpenseChart";
import { MonthlyProfitChart } from "./MonthlyProfitChart";
import { InvoiceStatusChart } from "./InvoiceStatusChart";

export function DashboardPage() {
  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Dashboard"
          subtitle="Financial overview for Rabbar Africa"
        />

        <StatCardsGrid />

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="4">
          <RevenueExpenseChart />
          <InvoiceStatusChart />
        </Grid>

        <MonthlyProfitChart />
      </Stack>
    </UserDashboardContainer>
  );
}
