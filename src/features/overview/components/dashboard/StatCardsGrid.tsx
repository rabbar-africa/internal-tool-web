import { Grid } from "@chakra-ui/react";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/utils/calculations";
import { MOCK_DASHBOARD_STATS } from "@/shared/data/mock";
import { Money } from "@/assets/custom/Money";
import { ChartBar } from "@/assets/custom/ChartBar";
import { CheckCircle } from "@/assets/custom/CheckCircle";
import { ClockIcon } from "@/assets/custom/ClockIcon";
import { WarningIcon } from "@/assets/custom/WarningIcon";
import { NoteIcon } from "@/assets/custom/NoteIcon";

export function StatCardsGrid() {
  const stats = MOCK_DASHBOARD_STATS;

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap="4"
    >
      <StatCard
        label="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={<Money width="22px" height="22px" color="#293885" />}
        iconBg="#EEF1FF"
        trend="up"
        trendValue="This month"
      />
      <StatCard
        label="Total Expenses"
        value={formatCurrency(stats.totalExpenses)}
        icon={<ChartBar width="22px" height="22px" color="#d32f2f" />}
        iconBg="#FFEBEE"
        trend="down"
        trendValue="Approved only"
      />
      <StatCard
        label="Net Profit"
        value={formatCurrency(stats.netProfit)}
        icon={<NoteIcon width="22px" height="22px" color="#2e7d32" />}
        iconBg="#E8F5E9"
        trend={stats.netProfit >= 0 ? "up" : "down"}
        trendValue={`${((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}% margin`}
      />
      <StatCard
        label="Paid Invoices"
        value={String(stats.paidInvoicesCount)}
        icon={<CheckCircle width="22px" height="22px" color="#2e7d32" />}
        iconBg="#E8F5E9"
      />
      <StatCard
        label="Outstanding Invoices"
        value={String(stats.outstandingInvoicesCount)}
        icon={<ClockIcon width="22px" height="22px" color="#e65100" />}
        iconBg="#FFF3E0"
      />
      <StatCard
        label="Overdue Invoices"
        value={String(stats.overdueInvoicesCount)}
        icon={<WarningIcon width="22px" height="22px" color="#c62828" />}
        iconBg="#FFEBEE"
      />
    </Grid>
  );
}
