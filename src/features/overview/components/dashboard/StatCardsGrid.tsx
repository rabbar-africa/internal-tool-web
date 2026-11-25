import { Grid } from "@chakra-ui/react";
import { CountUp } from "@/components/ui/CountUp";
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

/** How many cards the user may see. */
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
  if (visibleCardCount(visible) === 0) return null;

  // While loading, every card the user may see is drawn with its label and
  // icon; only the figures shimmer until the numbers arrive and count up.
  const loading = isLoading || !summary;
  const s = summary;
  const money = (v: number) => formatCurrency(v, currency);
  const countMoney = (v: number) => <CountUp value={v} format={money} />;
  /** Shown while loading; once loaded, only if the API sent the figure. */
  const has = (v: unknown) => loading || (v !== null && v !== undefined);

  const cards = [
    visible.invoices && has(s?.invoiced) && (
      <StatCard
        key="invoiced"
        label="Invoiced"
        loading={loading}
        value={s?.invoiced != null && countMoney(s.invoiced)}
        icon={<ChartBar width="22px" height="22px" color="#6478C0" />}
        iconBg="#EEF1FB"
        trendValue={plural(s?.invoiceCount ?? 0, "invoice")}
      />
    ),
    visible.finance && has(s?.netProfit) && (
      <StatCard
        key="profit"
        label="Net Profit"
        loading={loading}
        value={s?.netProfit != null && countMoney(s.netProfit)}
        icon={<MonitorArrowUp width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={(s?.netProfit ?? 0) >= 0 ? "up" : "down"}
        trendValue="Collected less expenses"
      />
    ),
    visible.finance && has(s?.expenses) && (
      <StatCard
        key="expenses"
        label="Expenses"
        loading={loading}
        value={s?.expenses != null && countMoney(s.expenses)}
        icon={<NoteIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trendValue={plural(s?.expenseCount ?? 0, "expense")}
      />
    ),
    visible.invoices && has(s?.overdue) && (
      <StatCard
        key="overdue"
        label="Overdue"
        loading={loading}
        value={s?.overdue && countMoney(s.overdue.amount)}
        icon={<WarningIcon width="22px" height="22px" color="#C1665A" />}
        iconBg="#FBEEEC"
        trend={(s?.overdue?.count ?? 0) > 0 ? "down" : "neutral"}
        trendValue={`${plural(s?.overdue?.count ?? 0, "invoice")} past due`}
      />
    ),
    visible.revenue && has(s?.revenueCollected) && (
      <StatCard
        key="revenue"
        label="Total Revenue"
        loading={loading}
        value={s?.revenueCollected != null && countMoney(s.revenueCollected)}
        icon={<Money width="22px" height="22px" color="#4F9D77" />}
        iconBg="#EBF4EF"
        trend={(s?.revenueCollected ?? 0) > 0 ? "up" : "neutral"}
        trendValue={
          s?.heldAsCredit
            ? `Paid on invoices; ${money(s.heldAsCredit)} more held as customer credit`
            : "Paid on invoices this period"
        }
      />
    ),
    visible.customers && has(s?.totalCustomers) && (
      <StatCard
        key="customers"
        label="Customers"
        loading={loading}
        value={
          s?.totalCustomers != null && <CountUp value={s.totalCustomers} />
        }
        icon={<UsersIcon width="22px" height="22px" color="#293885" />}
        iconBg="#EEF1FB"
        trend={(s?.newCustomers ?? 0) > 0 ? "up" : "neutral"}
        trendValue={`${s?.newCustomers ?? 0} new this period`}
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
