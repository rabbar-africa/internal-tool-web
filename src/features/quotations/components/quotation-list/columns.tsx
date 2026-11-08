import { useMemo } from "react";
import { Link, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import type { IQuotation } from "@/shared/interface/quotation";
import { QuotationStatusBadge } from "../QuotationStatusBadge";
import { QUOTATION_STATUS_LABELS } from "../../utils/quotation-status";

const formatDay = (value?: string | null) =>
  value ? moment(value).format("DD MMM YYYY") : "—";

/** The quote's customer, however it was saved. */
export const quotationCustomer = (quote: IQuotation) =>
  quote.customerName ?? quote.client?.displayName ?? "—";

export function useQuotationListColumns(): ColumnDef<IQuotation>[] {
  const { formatMoney } = useFormatMoney();

  return useMemo<ColumnDef<IQuotation>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <Text fontSize="12px" color="gray.300">
            {formatDay(getValue() as string)}
          </Text>
        ),
      },
      {
        accessorKey: "quotationNumber",
        header: "Quote #",
        cell: ({ getValue }) => (
          <Text
            fontSize="13px"
            color="primary.300"
            fontWeight="700"
            letterSpacing="0.3px"
          >
            {(getValue() as string) || "—"}
          </Text>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="500">
            {quotationCustomer(row.original)}
          </Text>
        ),
      },
      {
        accessorKey: "referenceNumber",
        header: "Reference",
        cell: ({ getValue }) => (
          <Text fontSize="12px" color="gray.300">
            {(getValue() as string) || "—"}
          </Text>
        ),
      },
      {
        accessorKey: "expiryDate",
        header: "Valid Until",
        cell: ({ row }) => {
          const expired = row.original.displayStatus === "EXPIRED";
          return (
            <Text
              fontSize="12px"
              color={expired ? "warning.500" : "gray.300"}
              fontWeight={expired ? "600" : "400"}
            >
              {row.original.expiryDate
                ? formatDay(row.original.expiryDate)
                : "No expiry"}
            </Text>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const { displayStatus, invoice } = row.original;
          return (
            <>
              <QuotationStatusBadge status={displayStatus} />
              {displayStatus === "INVOICED" && invoice && (
                <Link
                  asChild
                  fontSize="11px"
                  color="primary.300"
                  mt="1"
                  display="block"
                  textAlign="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RouterLink
                    to={RouteConstants.invoices.detail.generate({
                      id: invoice.id,
                    })}
                  >
                    {invoice.invoiceNumber}
                  </RouterLink>
                </Link>
              )}
            </>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ getValue }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="600">
            {formatMoney(getValue() as string)}
          </Text>
        ),
      },
    ],
    [formatMoney],
  );
}

export const QUOTATION_CSV_HEADERS = {
  date: "Date",
  quotationNumber: "Quote #",
  customer: "Customer",
  referenceNumber: "Reference",
  expiryDate: "Valid Until",
  status: "Status",
  total: "Amount",
  invoiceNumber: "Invoice #",
} as const;

export function quotationToCsvRow(quote: IQuotation) {
  return {
    date: quote.date?.split("T")[0] ?? "",
    quotationNumber: quote.quotationNumber,
    customer: quotationCustomer(quote),
    referenceNumber: quote.referenceNumber ?? "",
    expiryDate: quote.expiryDate?.split("T")[0] ?? "",
    status: QUOTATION_STATUS_LABELS[quote.displayStatus] ?? quote.displayStatus,
    total: quote.total,
    invoiceNumber: quote.invoice?.invoiceNumber ?? "",
  };
}
