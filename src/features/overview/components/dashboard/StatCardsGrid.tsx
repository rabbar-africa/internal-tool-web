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
  /** The cards the user may see, by card; the API also nulls the rest. */
  visible: StatCardVisibility;
  currency?: string;
  isLoading?: boolean;
}

export interface StatCardVisibility {
  invoices: boolean;
  revenue: boolean;
  finance: boolean;
  customers: boolean;
}

const gridColumns = {
  base: "1fr",
  sm: "repeat(2, 1fr)",
  lg: "repeat(3, 1fr)",
};

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

/** How many cards the user can see, for the loading skeleton. */
export const visibleCardCount = (visible: StatCardVisibility) =>
  (visible.invoices ? 2 : 0) +
  (visible.finance ? 2 : 0) +
  (visible.revenue ? 1 : 0) +
  (visible.customers ? 1 : 0);

export function StatCardsGrid({
  summary,
  visible,
  currency = "NGN",
  isLoading,
}: StatCardsGridProps) {
  const expected = visibleCardCount(visible);
  if (expected === 0) return null;

  if (isLoading || !summary) {
    return (
      <Grid templateColumns={gridColumns} gap="4">
        {Array.from({ length: expected }).map((_, i) => (
          <Skeleton key={i} height="110px" rounded="xl" />
        ))}
      </Grid>
    );
  }

  const money = (v: number) => formatCurrency(v, currency);
  const {
    invoiced,
    invoiceCount,
    netProfit,
    expenses,
    expenseCount,
    overdue,
    revenueCollected,
    totalCustomers,
    newCustomers,
  } = summary;

  // Each card shows only when the user may see it and the API sent it.
  const cards = [
    visible.invoices && invoiced !== null && (
      <StatCard
        key="invoiced"
        label="Invoiced"
        value={money(invoiced)}
        icon={<ChartBar width="22px" height="22px" color="#6478C0" />}
        iconBg="#EEF1FB"
        trendValue={plural(invoiceCount ?? 0, "invoice")}
      />
    ),
    visible.finance && netProfit !== null && (
      <StatCard
        key="profit"
        label="Net Profit"
        value={money(netProfit)}
        icon={<MonitorArrowUp width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={netProfit >= 0 ? "up" : "down"}
        trendValue="Collected less expenses"
      />
    ),
    visible.finance && expenses !== null && (
      <StatCard
        key="expenses"
        label="Expenses"
        value={money(expenses)}
        icon={<NoteIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trendValue={plural(expenseCount ?? 0, "expense")}
      />
    ),
    visible.invoices && overdue !== null && (
      <StatCard
        key="overdue"
        label="Overdue"
        value={money(overdue.amount)}
        icon={<WarningIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trend={overdue.count > 0 ? "down" : "neutral"}
        trendValue={`${plural(overdue.count, "invoice")} past due`}
      />
    ),
    visible.revenue && revenueCollected !== null && (
      <StatCard
        key="revenue"
        label="Total Revenue"
        value={money(revenueCollected)}
        icon={<Money width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={revenueCollected > 0 ? "up" : "neutral"}
        trendValue="Payments received this period"
      />
    ),
    visible.customers && totalCustomers !== null && (
      <StatCard
        key="customers"
        label="Customers"
        value={String(totalCustomers)}
        icon={<UsersIcon width="22px" height="22px" color="#293885" />}
        iconBg="#EEF1FB"
        trend={(newCustomers ?? 0) > 0 ? "up" : "neutral"}
        trendValue={`${newCustomers ?? 0} new this period`}
      />
    ),
  ].filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <Grid templateColumns={gridColumns} gap="4">
      {cards}
    </Grid>
  );
}
