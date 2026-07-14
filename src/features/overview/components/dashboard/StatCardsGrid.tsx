import { Grid, Skeleton } from "@chakra-ui/react";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/utils/calculations";
import { ChartBar } from "@/assets/custom/ChartBar";
import { UsersIcon } from "@/assets/custom/UsersIcon";
import { WarningIcon } from "@/assets/custom/WarningIcon";
import { NoteIcon } from "@/assets/custom/NoteIcon";
import { MonitorArrowUp } from "@/assets/custom/MonitorArrowUp";
import { Money } from "@/assets/custom/Money";
import type { DashboardSummary } from "../../interface";

interface StatCardsGridProps {
  summary?: DashboardSummary;
  currency?: string;
  isLoading?: boolean;
}

const gridColumns = {
  base: "1fr",
  sm: "repeat(2, 1fr)",
  lg: "repeat(3, 1fr)",
};

export function StatCardsGrid({
  summary,
  currency = "NGN",
  isLoading,
}: StatCardsGridProps) {
  if (isLoading || !summary) {
    return (
      <Grid templateColumns={gridColumns} gap="4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="110px" rounded="xl" />
        ))}
      </Grid>
    );
  }

  const money = (v: number) => formatCurrency(v, currency);

  return (
    <Grid templateColumns={gridColumns} gap="4">
      <StatCard
        label="Invoiced"
        value={money(summary.invoiced)}
        icon={<ChartBar width="22px" height="22px" color="#6478C0" />}
        iconBg="#EEF1FB"
        trendValue={`${summary.invoiceCount} invoice${summary.invoiceCount === 1 ? "" : "s"}`}
      />
      <StatCard
        label="Net Profit"
        value={money(summary.netProfit)}
        icon={<MonitorArrowUp width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={summary.netProfit >= 0 ? "up" : "down"}
        trendValue="Collected less expenses"
      />
      <StatCard
        label="Expenses"
        value={money(summary.expenses)}
        icon={<NoteIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trendValue={`${summary.expenseCount} expense${summary.expenseCount === 1 ? "" : "s"}`}
      />
      <StatCard
        label="Overdue"
        value={money(summary.overdue.amount)}
        icon={<WarningIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trend={summary.overdue.count > 0 ? "down" : "neutral"}
        trendValue={`${summary.overdue.count} invoice${summary.overdue.count === 1 ? "" : "s"} past due`}
      />
      <StatCard
        label="Total Revenue"
        value={money(summary.revenueCollected)}
        icon={<Money width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={summary.revenueCollected > 0 ? "up" : "neutral"}
        trendValue="Payments received this period"
      />
      <StatCard
        label="Customers"
        value={String(summary.totalCustomers)}
        icon={<UsersIcon width="22px" height="22px" color="#293885" />}
        iconBg="#EEF1FB"
        trend={summary.newCustomers > 0 ? "up" : "neutral"}
        trendValue={`${summary.newCustomers} new this period`}
      />
    </Grid>
  );
}
