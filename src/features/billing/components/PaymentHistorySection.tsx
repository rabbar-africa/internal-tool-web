import { Badge, Box, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/table";
import type { BillingPayment } from "../api/types";
import {
  describePaymentMethod,
  formatLongDate,
  formatPrice,
  formatShortDate,
} from "../utils/format";
import { BillingCard, CardBody } from "./BillingCard";

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
      const { periodStart, periodEnd, periodMonths } = row.original;
      return (
        <Box>
          <Text textStyle="small-regular" color="gray.400" whiteSpace="nowrap">
            {periodStart && periodEnd
              ? `${formatShortDate(periodStart)} – ${formatLongDate(periodEnd)}`
              : "—"}
          </Text>
          {periodMonths === 12 && (
            <Text fontSize="11px" color="gray.300" fontWeight="600">
              Yearly
            </Text>
          )}
        </Box>
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
    id: "status",
    header: "Status",
    cell: () => (
      <Badge
        size="sm"
        bg="success.50"
        color="success.400"
        borderWidth="1px"
        borderColor="success.75"
        rounded="full"
        px="2"
      >
        Paid
      </Badge>
    ),
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
    <BillingCard
      title="Billing history"
      subtitle="Every payment for your plan, as Paystack recorded it."
    >
      {payments.length ? (
        <Box overflowX="auto" minW={0}>
          <CustomTable data={payments} columns={columns} />
        </Box>
      ) : (
        <CardBody>
          <Text fontSize="14px" color="gray.300">
            No payments yet.
          </Text>
        </CardBody>
      )}
    </BillingCard>
  );
}
