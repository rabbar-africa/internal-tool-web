import { StatCell, StatStrip } from "@/components/common/StatStrip";
import { CountUp } from "@/components/ui/CountUp";
import { formatMoney } from "@/hooks/useFormatMoney";
import { useInvoiceStatsQuery } from "../../api/query";

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString("en-NG")} ${n === 1 ? one : many}`;

/** "₦150,000" — kobo only when there is some. */
const money = (amount: number, currency: string) =>
  formatMoney(amount, {
    currencyCode: currency,
    fractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

/**
 * The strip above the invoice list (`GET /invoices/stats`): what's owed, what
 * falls due in the next 30 days, what's overdue, and what came in this month.
 * Amounts are balances still owed, not invoice totals. Hidden if it can't
 * load.
 */
export function InvoiceStatsStrip({
  onShowOverdue,
}: {
  onShowOverdue: () => void;
}) {
  const { data, isLoading, isError } = useInvoiceStatsQuery();
  if (isError) return null;

  const currency = data?.currency ?? "NGN";
  const amount = (v: number) => (
    <CountUp value={v} format={(n) => money(n, currency)} />
  );

  return (
    <StatStrip>
      <StatCell
        dot="warning.300"
        label="Total outstanding receivables"
        loading={isLoading}
        value={data && amount(data.outstanding.amount)}
        note={data && plural(data.outstanding.count, "invoice")}
      />
      <StatCell
        dot="primary.100"
        label="Due within 30 days"
        loading={isLoading}
        value={data && amount(data.dueWithin30Days.amount)}
        note={data && plural(data.dueWithin30Days.count, "invoice")}
      />
      <StatCell
        dot="error.100"
        label="Overdue invoices"
        loading={isLoading}
        value={data && amount(data.overdue.amount)}
        note={data && plural(data.overdue.count, "invoice")}
        onClick={data?.overdue.count ? onShowOverdue : undefined}
        actionLabel="Show overdue invoices"
      />
      <StatCell
        dot="success.100"
        label="Received this month"
        loading={isLoading}
        value={data && amount(data.receivedThisMonth.amount)}
        note={data && plural(data.receivedThisMonth.payments, "payment")}
      />
    </StatStrip>
  );
}
