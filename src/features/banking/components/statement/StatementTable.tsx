import { useMemo } from "react";
import { Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CustomTable } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import type {
  AccountStatement,
  StatementEntryKind,
} from "@/shared/interface/banking";

/** A statement line, or one of the two summary rows that frame them. */
interface StatementRow {
  key: string;
  kind: StatementEntryKind | "BROUGHT_FORWARD" | "CLOSING";
  date: string;
  reference: string | null;
  title: string;
  details: string | null;
  moneyIn: number;
  moneyOut: number;
  balance: number;
  sourceId: string | null;
}

const isSummary = (row: StatementRow) =>
  row.kind === "BROUGHT_FORWARD" || row.kind === "CLOSING";

/** Where a line's payment, expense or transfer lives. */
function linkFor(row: StatementRow, accountId: string): string | null {
  if (!row.sourceId) return null;
  switch (row.kind) {
    case "PAYMENT_RECEIVED":
    case "BANK_CHARGE":
      return RouteConstants.payments.detail.generate({ id: row.sourceId });
    case "EXPENSE":
      return RouteConstants.expenses.edit.generate({ id: row.sourceId });
    case "TRANSFER_IN":
    case "TRANSFER_OUT": {
      // Transfers have no page of their own: open the list on that day.
      const day = row.date.slice(0, 10);
      return RouteConstants.banking.transfers.generate(
        {},
        { accountId, dateFrom: day, dateTo: day },
      );
    }
    default:
      return null;
  }
}

export function StatementTable({
  statement,
  isLoading,
}: {
  statement?: AccountStatement;
  isLoading?: boolean;
}) {
  const navigate = useNavigate();
  const currencyCode = statement?.currencyCode ?? "NGN";
  const money = (amount: number) => formatCurrency(amount, currencyCode);

  const rows = useMemo<StatementRow[]>(() => {
    if (!statement) return [];
    return [
      {
        key: "brought-forward",
        kind: "BROUGHT_FORWARD",
        date: statement.period.from,
        reference: null,
        title: "Balance brought forward",
        details: null,
        moneyIn: 0,
        moneyOut: 0,
        balance: statement.openingBalance,
        sourceId: null,
      },
      ...statement.lines.map((line, index) => ({
        ...line,
        key: `${line.kind}-${line.sourceId ?? "none"}-${index}`,
      })),
      {
        key: "closing",
        kind: "CLOSING",
        date: statement.period.to,
        reference: null,
        title: "Closing balance",
        details: null,
        moneyIn: statement.totals.moneyIn,
        moneyOut: statement.totals.moneyOut,
        balance: statement.closingBalance,
        sourceId: null,
      },
    ];
  }, [statement]);

  const columns = useMemo<ColumnDef<StatementRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.500" whiteSpace="nowrap">
            {moment(row.original.date.slice(0, 10)).format("DD MMM YYYY")}
          </Text>
        ),
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.400" whiteSpace="nowrap">
            {row.original.reference ?? ""}
          </Text>
        ),
      },
      {
        accessorKey: "title",
        header: "Description",
        cell: ({ row }) => (
          <>
            <Text
              textStyle={
                isSummary(row.original) ? "small-semibold" : "small-regular"
              }
              color="gray.500"
            >
              {row.original.title}
            </Text>
            {row.original.details && (
              <Text textStyle="tiny-regular" color="gray.300">
                {row.original.details}
              </Text>
            )}
          </>
        ),
      },
      {
        accessorKey: "moneyIn",
        header: "Money in",
        cell: ({ row }) => (
          <Text
            textStyle="small-semibold"
            color="success.300"
            textAlign="right"
          >
            {row.original.moneyIn ? money(row.original.moneyIn) : ""}
          </Text>
        ),
      },
      {
        accessorKey: "moneyOut",
        header: "Money out",
        cell: ({ row }) => (
          <Text textStyle="small-semibold" color="error.300" textAlign="right">
            {row.original.moneyOut ? money(row.original.moneyOut) : ""}
          </Text>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <Text
            textStyle="small-semibold"
            color={row.original.balance < 0 ? "error.300" : "gray.500"}
            textAlign="right"
            whiteSpace="nowrap"
          >
            {money(row.original.balance)}
          </Text>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currencyCode],
  );

  return (
    <CustomTable
      stickyHeader
      data={rows}
      columns={columns}
      loading={isLoading}
      onRowClick={(row) => {
        const to = statement && linkFor(row.original, statement.account.id);
        if (to) navigate(to);
      }}
    />
  );
}
