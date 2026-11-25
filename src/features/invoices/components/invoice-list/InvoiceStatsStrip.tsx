import type { ReactNode } from "react";
import { Box, Flex, Grid, Skeleton, Text } from "@chakra-ui/react";
import { formatMoney } from "@/hooks/useFormatMoney";
import { CARD_SHADOW, FAINT_DIVIDER, FAINT_EDGE } from "@/theme/surfaces";
import { useInvoiceStatsQuery } from "../../api/query";

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString("en-NG")} ${n === 1 ? one : many}`;

/** "₦150,000" — kobo only when there is some. */
const money = (amount: number, currency: string) =>
  formatMoney(amount, {
    currencyCode: currency,
    fractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

interface CellProps {
  dot: string;
  label: string;
  value: ReactNode;
  note?: string;
  /** Opens the list filtered to these invoices. */
  onClick?: () => void;
  loading?: boolean;
}

function Cell({ dot, label, value, note, onClick, loading }: CellProps) {
  return (
    <Box
      as={onClick ? "button" : "div"}
      onClick={onClick}
      textAlign="left"
      bg="white"
      px="5"
      py="4"
      cursor={onClick ? "pointer" : "default"}
      transition="background .15s ease"
      _hover={onClick ? { bg: "gray.50" } : undefined}
    >
      <Flex align="center" gap="2">
        <Box boxSize="7px" rounded="full" bg={dot} flexShrink={0} />
        <Text fontSize="13px" color="gray.300" truncate>
          {label}
        </Text>
      </Flex>
      {loading ? (
        <Skeleton h="1.75rem" w="7rem" mt="1.5" rounded="md" />
      ) : (
        <Text
          fontSize="22px"
          fontWeight="700"
          color="gray.500"
          mt="1"
          lineHeight="1.3"
          truncate
        >
          {value}
        </Text>
      )}
      {note && !loading && (
        <Text fontSize="12px" color="gray.300" mt="0.5" truncate>
          {note}
        </Text>
      )}
    </Box>
  );
}

/**
 * The strip above the invoice list (`GET /invoices/stats`): what's owed, what
 * falls due in the next 30 days, what's overdue, and what came in this month.
 * Amounts
 * are balances still owed, not invoice totals. Hidden if it can't load.
 */
export function InvoiceStatsStrip({
  onShowOverdue,
}: {
  onShowOverdue: () => void;
}) {
  const { data, isLoading, isError } = useInvoiceStatsQuery();
  if (isError) return null;

  const currency = data?.currency ?? "NGN";

  return (
    <Grid
      templateColumns={{
        base: "repeat(2, 1fr)",
        lg: "repeat(4, 1fr)",
      }}
      // The gaps show the background through: hairlines between the cells.
      gap="1px"
      bg={FAINT_DIVIDER}
      rounded="18px"
      borderWidth="1px"
      borderColor={FAINT_EDGE}
      boxShadow={CARD_SHADOW}
      overflow="hidden"
    >
      <Cell
        dot="warning.300"
        label="Total outstanding receivables"
        loading={isLoading}
        value={data && money(data.outstanding.amount, currency)}
        note={data && plural(data.outstanding.count, "invoice")}
      />
      <Cell
        dot="primary.100"
        label="Due within 30 days"
        loading={isLoading}
        value={data && money(data.dueWithin30Days.amount, currency)}
        note={data && plural(data.dueWithin30Days.count, "invoice")}
      />
      <Cell
        dot="error.100"
        label="Overdue invoices"
        loading={isLoading}
        value={data && money(data.overdue.amount, currency)}
        note={data && plural(data.overdue.count, "invoice")}
        onClick={data?.overdue.count ? onShowOverdue : undefined}
      />
      <Cell
        dot="success.100"
        label="Received this month"
        loading={isLoading}
        value={data && money(data.receivedThisMonth.amount, currency)}
        note={data && plural(data.receivedThisMonth.payments, "payment")}
      />
    </Grid>
  );
}
