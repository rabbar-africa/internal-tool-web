import { StatCell, StatStrip } from "@/components/common/StatStrip";
import { CountUp } from "@/components/ui/CountUp";
import { formatMoney } from "@/hooks/useFormatMoney";
import type { ExpenseStatsPeriod } from "@/shared/interface/expense";
import { useExpenseStatsQuery } from "../api/query";
import { useExpenseVat } from "./ExpenseVatField";

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString("en-NG")} ${n === 1 ? one : many}`;

/** "₦150,000" — kobo only when there is some. */
const money = (amount: number, currency: string) =>
  formatMoney(amount, {
    currencyCode: currency,
    fractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

interface ExpenseStatsStripProps {
  /** Opens the list for a date range, and a category if given. */
  onShowRange: (range: {
    from: string;
    to: string;
    categoryId?: string;
  }) => void;
  /** Opens the recurring expenses page. */
  onShowRecurring: () => void;
}

/**
 * The strip above the expense list (`GET /expenses/stats`): this month's
 * spending, how much of it went on jobs, the biggest category, what the
 * schedules will record next, and claimable VAT for a VAT-registered
 * business. Amounts are what was paid, VAT included. Hidden if it can't load.
 */
export function ExpenseStatsStrip({
  onShowRange,
  // onShowRecurring,
}: ExpenseStatsStripProps) {
  const { data, isLoading, isError } = useExpenseStatsQuery();
  // Known before the figures arrive, so the VAT cell's place is held.
  const { registered } = useExpenseVat();
  if (isError) return null;

  const currency = data?.currency ?? "NGN";
  const fmt = (v: number) => money(v, currency);
  const amount = (v: number) => <CountUp value={v} format={fmt} />;
  const showVat = data ? data.claimableVatThisMonth.vatRegistered : registered;

  const month: ExpenseStatsPeriod | undefined = data?.thisMonth;
  const top = data?.topCategoryThisMonth;
  // const recurring = data?.recurringNext30Days;
  const split = data?.thisMonthSplit;

  return (
    <StatStrip>
      <StatCell
        dot="primary.100"
        label="Spent this month"
        loading={isLoading}
        value={month && amount(month.amount)}
        // This month isn't over, so last month is the whole of it.
        note={
          data &&
          `${plural(data.thisMonth.count, "expense")} · ${fmt(
            data.lastMonth.amount,
          )} all last month`
        }
        onClick={
          month?.count
            ? () => onShowRange({ from: month.from, to: month.to })
            : undefined
        }
        actionLabel="Show this month's expenses"
      />
      <StatCell
        dot="success.100"
        label="On jobs this month"
        loading={isLoading}
        value={split && amount(split.onJobs.amount)}
        note={split && `${fmt(split.overheads.amount)} on overheads`}
      />
      <StatCell
        dot="warning.300"
        label={top ? `Top category · ${top.name}` : "Top category"}
        loading={isLoading}
        value={data && (top ? amount(top.amount) : "—")}
        note={
          data &&
          (top
            ? `${plural(top.count, "expense")} this month`
            : "No expenses yet this month")
        }
        onClick={
          top && month
            ? () =>
                onShowRange({
                  from: month.from,
                  to: month.to,
                  categoryId: top.id,
                })
            : undefined
        }
        actionLabel={top ? `Show this month's ${top.name} expenses` : undefined}
      />
      {/* <StatCell
        dot="gray.200"
        label="Recurring, next 30 days"
        loading={isLoading}
        value={recurring && amount(recurring.amount)}
        note={
          recurring &&
          (recurring.schedules
            ? `${plural(recurring.count, "expense")} from ${plural(
                recurring.schedules,
                "schedule",
              )}`
            : "No active schedules")
        }
        onClick={onShowRecurring}
        actionLabel="Open recurring expenses"
      /> */}
      {showVat && (
        <StatCell
          dot="primary.300"
          label="Claimable VAT this month"
          loading={isLoading}
          value={data && amount(data.claimableVatThisMonth.amount)}
          note="Input VAT you can claim back"
        />
      )}
    </StatStrip>
  );
}
