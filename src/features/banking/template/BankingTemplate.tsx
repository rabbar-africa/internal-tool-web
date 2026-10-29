import { useMemo, useState } from "react";
import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomTable, type TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import type { BusinessAccountRow } from "@/shared/interface/banking";
import {
  useDownloadBusinessStatementPdfMutation,
  useDownloadStatementPdfMutation,
  useGetBusinessStatementQuery,
} from "../api";
import {
  StatementRangePicker,
  useStatementRange,
} from "../components/statement/StatementRangePicker";
import { StatementSummary } from "../components/statement/StatementSummary";
import { EmailStatementModal } from "../components/statement/EmailStatementModal";

const formatDay = (day: string) => moment(day).format("DD MMM YYYY");

/**
 * Banking home: one period, the whole business's statement to download or
 * email, and every account (Cash included) with its own statement.
 */
export function BankingTemplate() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { preset, range, setRange } = useStatementRange();

  const { data, isLoading, isFetching } = useGetBusinessStatementQuery(range);
  const statement = data?.data;
  const currencyCode = statement?.currencyCode ?? "NGN";
  const money = (amount: number) => formatCurrency(amount, currencyCode);

  const { mutate: downloadBusiness, isPending: isDownloadingBusiness } =
    useDownloadBusinessStatementPdfMutation();
  const { mutate: downloadAccount } = useDownloadStatementPdfMutation();

  // `null` = the business statement; an id = that account's.
  const [emailing, setEmailing] = useState<{ accountId?: string } | null>(null);

  // The account statement reads the same period keys from the URL.
  const openStatement = (accountId: string) =>
    navigate(
      `${RouteConstants.banking.statement.generate({ id: accountId })}${search}`,
    );

  const columns = useMemo<ColumnDef<BusinessAccountRow>[]>(
    () => [
      {
        accessorKey: "label",
        header: "Account",
        cell: ({ row }) => (
          <Flex align="center" gap="2" flexWrap="wrap">
            <Text textStyle="small-semibold" color="gray.500">
              {row.original.label}
            </Text>
            {row.original.isPrimary && (
              <Badge size="sm" variant="subtle" colorPalette="blue">
                Primary
              </Badge>
            )}
            {row.original.type === "CASH" && (
              <Badge size="sm" variant="subtle">
                Cash
              </Badge>
            )}
          </Flex>
        ),
      },
      {
        accessorKey: "openingBalance",
        header: "Opening",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <Text
              textStyle="small-regular"
              color={value < 0 ? "error.300" : "gray.500"}
              whiteSpace="nowrap"
            >
              {money(value)}
            </Text>
          );
        },
      },
      {
        accessorKey: "moneyIn",
        header: "Money in",
        cell: ({ getValue }) => (
          <Text
            textStyle="small-semibold"
            color="success.300"
            whiteSpace="nowrap"
          >
            {money(getValue() as number)}
          </Text>
        ),
      },
      {
        accessorKey: "moneyOut",
        header: "Money out",
        cell: ({ getValue }) => (
          <Text
            textStyle="small-semibold"
            color="error.300"
            whiteSpace="nowrap"
          >
            {money(getValue() as number)}
          </Text>
        ),
      },
      {
        accessorKey: "closingBalance",
        header: "Closing",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <Text
              textStyle="small-semibold"
              color={value < 0 ? "error.300" : "gray.500"}
              whiteSpace="nowrap"
            >
              {money(value)}
            </Text>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currencyCode],
  );

  const actions: TableAction<BusinessAccountRow>[] = [
    {
      label: "View statement",
      value: "view",
      onClick: (row) => openStatement(row.id),
    },
    {
      label: "Download PDF",
      value: "download",
      onClick: (row) => downloadAccount({ accountId: row.id, range }),
    },
    {
      label: "Email",
      value: "email",
      onClick: (row) => setEmailing({ accountId: row.id }),
    },
  ];

  const total = statement?.accounts.total;
  const unassigned = statement?.accounts.unassigned;

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Banking"
          subtitle="Statements for each account and for the whole business"
          action={
            <StatementRangePicker
              preset={preset}
              range={range}
              onChange={setRange}
            />
          }
        />

        {/* Business statement */}
        <Box
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          p={{ base: "1rem", md: "1.5rem" }}
        >
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap="3"
            mb="5"
          >
            <Box>
              <Text textStyle="large-bold" color="gray.500">
                Business statement
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {statement
                  ? `${formatDay(statement.period.from)} – ${formatDay(
                      statement.period.to,
                    )} · money by account, sales, spending, profit and tax`
                  : "Money by account, sales, spending, profit and tax"}
              </Text>
            </Box>
            <Flex gap="2">
              <Button
                variant="outline"
                size="sm"
                disabled={!statement}
                onClick={() => setEmailing({})}
              >
                Email
              </Button>
              <Button
                size="sm"
                loading={isDownloadingBusiness}
                disabled={!statement}
                onClick={() => downloadBusiness(range)}
              >
                Download PDF
              </Button>
            </Flex>
          </Flex>

          {total && (
            <StatementSummary
              currencyCode={currencyCode}
              openingBalance={total.openingBalance}
              moneyIn={total.moneyIn}
              moneyOut={total.moneyOut}
              closingBalance={total.closingBalance}
            />
          )}
          {statement && (
            <Text textStyle="tiny-regular" color="gray.300" mt="3">
              All accounts together. Money moved between your own accounts isn't
              counted as money in or out.
            </Text>
          )}
        </Box>

        {/* Accounts */}
        <Box
          pt={{ base: "1rem", md: "1.5rem" }}
          pb={{ base: "1rem", md: "1.5rem" }}
          bg="white"
          px={{ base: "0.75rem", md: "1rem" }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          opacity={isFetching && !isLoading ? 0.6 : 1}
          transition="opacity 0.15s"
        >
          <Box mb="4">
            <Text textStyle="large-bold" color="gray.500">
              Account statements
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Open an account for every payment, expense and transfer, with a
              running balance
            </Text>
          </Box>
          <Box overflowX="auto" minW={0}>
            <CustomTable
              data={statement?.accounts.rows ?? []}
              columns={columns}
              loading={isLoading}
              actions={actions}
              enableActions
              onRowClick={(row) => openStatement(row.original.id)}
            />
          </Box>
          {unassigned && (
            <Text textStyle="tiny-regular" color="gray.300" mt="3">
              Also recorded with no account (before accounts were set up):{" "}
              {money(unassigned.moneyIn)} in, {money(unassigned.moneyOut)} out.
            </Text>
          )}
        </Box>
      </Stack>

      <EmailStatementModal
        open={Boolean(emailing)}
        onClose={() => setEmailing(null)}
        accountId={emailing?.accountId}
        range={range}
      />
    </>
  );
}
