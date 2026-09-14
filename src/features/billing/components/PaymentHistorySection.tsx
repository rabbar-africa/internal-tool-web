import { Box, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/table";
import { SectionTitle } from "@/features/settings/components/SectionTitle";
import type { BillingPayment } from "../api/types";
import {
  describePaymentMethod,
  formatLongDate,
  formatPrice,
  formatShortDate,
} from "../utils/format";

const columns: ColumnDef<BillingPayment>[] = [
  {
    id: "paidAt",
    header: "Date",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500" whiteSpace="nowrap">
        {formatLongDate(row.original.paidAt) || "—"}
      </Text>
    ),
  },
  {
    id: "period",
    header: "Covers",
    cell: ({ row }) => {
      const { periodStart, periodEnd } = row.original;
      return (
        <Text textStyle="small-regular" color="gray.400" whiteSpace="nowrap">
          {periodStart && periodEnd
            ? `${formatShortDate(periodStart)} – ${formatLongDate(periodEnd)}`
            : "—"}
        </Text>
      );
    },
  },
  {
    id: "method",
    header: "Paid by",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {describePaymentMethod(row.original.method)}
      </Text>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { amount, discountAmount, currency } = row.original;
      const saved = Number(discountAmount ?? 0);
      return (
        <Box>
          <Text
            textStyle="small-regular"
            color="gray.500"
            fontWeight="600"
            whiteSpace="nowrap"
          >
            {formatPrice(amount, currency)}
          </Text>
          {saved > 0 && (
            <Text fontSize="11px" color="success.300" whiteSpace="nowrap">
              You saved {formatPrice(saved, currency)}
            </Text>
          )}
        </Box>
      );
    },
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <Text fontSize="11px" color="gray.300" wordBreak="break-all">
        {row.original.reference || "—"}
      </Text>
    ),
  },
];

export function PaymentHistorySection({
  payments,
}: {
  payments: BillingPayment[];
}) {
  return (
    <Box>
      <SectionTitle title="Recent payments" subtitle="Your last 12 payments." />
      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={payments}
          columns={columns}
          NoDataText="No payments yet."
        />
      </Box>
    </Box>
  );
}
