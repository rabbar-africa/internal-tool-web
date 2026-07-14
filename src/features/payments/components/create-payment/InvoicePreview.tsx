import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { CarriedInvoice } from "@/shared/interface/invoice";
import { SectionCard } from "./SectionCard";

interface AllocationPreviewRow {
  invoiceNumber: string;
  balance: number;
  applied: number;
  isCarried: boolean;
}

interface InvoicePreviewProps {
  summary: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerName: string;
    currencyCode: string;
    total: number;
    balance: number;
    broughtForward: CarriedInvoice[];
    broughtForwardTotal: number;
    dueNow: number;
    allocationPreview: AllocationPreviewRow[];
    amount: number;
    balanceAfter: number;
    unusedAmount: number;
    overpaid: boolean;
  };
}

export function InvoicePreview({ summary }: InvoicePreviewProps) {
  const { formatMoney } = useFormatMoney();
  const money = (n: number) =>
    formatMoney(n, { currencyCode: summary.currencyCode });
  const date = (v: string) => (v ? moment(v).format("DD MMM YYYY") : "—");
  const hasCarry = summary.broughtForward.length > 0;

  return (
    <SectionCard
      step={1}
      title="Invoice"
      subtitle={
        hasCarry
          ? "This invoice also carries an earlier unpaid balance — one payment settles both"
          : "You're recording a payment for this invoice"
      }
    >
      <Stack gap="4">
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
          gap="4"
        >
          <Field
            label="Invoice #"
            value={summary.invoiceNumber || "—"}
            strong
          />
          <Field label="Customer" value={summary.customerName || "—"} />
          <Field label="Invoice Date" value={date(summary.invoiceDate)} />
          <Field label="Due Date" value={date(summary.dueDate)} />
        </Grid>

        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }}
          gap="3"
          borderTopWidth="1px"
          borderColor="gray.75"
          pt="4"
        >
          <Stat label="Invoice Total" value={money(summary.total)} />
          <Stat
            label={hasCarry ? "Total Due Now" : "Outstanding Balance"}
            value={money(hasCarry ? summary.dueNow : summary.balance)}
            color="orange.600"
          />
          <Stat
            label="Balance After Payment"
            value={money(summary.balanceAfter)}
            color={summary.balanceAfter <= 0 ? "green.600" : "gray.500"}
          />
        </Grid>

        {hasCarry && (
          <Box borderTopWidth="1px" borderColor="gray.75" pt="4">
            <Text fontSize="12px" fontWeight="600" color="gray.500" mb="1">
              How this payment will be applied
            </Text>
            <Text fontSize="11px" color="gray.300" mb="3">
              Older invoices are settled first, then this one.
            </Text>

            <Stack gap="2">
              {summary.allocationPreview.map((row) => (
                <Flex
                  key={row.invoiceNumber}
                  justify="space-between"
                  align="center"
                  gap="3"
                  px="3"
                  py="2"
                  rounded="md"
                  bg="gray.50"
                >
                  <Flex align="center" gap="2" minW="0">
                    <Text fontSize="13px" fontWeight="600" color="gray.500">
                      {row.invoiceNumber || "—"}
                    </Text>
                    <Text fontSize="11px" color="gray.300">
                      {row.isCarried ? "· brought forward" : "· this invoice"}
                    </Text>
                  </Flex>
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color={row.applied > 0 ? "green.600" : "gray.300"}
                    flexShrink={0}
                  >
                    {money(row.applied)}
                    <Text as="span" fontSize="11px" color="gray.300">
                      {" "}
                      / {money(row.balance)}
                    </Text>
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}

        {summary.overpaid && (
          <Box
            bg="orange.50"
            borderWidth="1px"
            borderColor="orange.100"
            rounded="md"
            px="3"
            py="2"
          >
            <Text fontSize="12px" color="orange.700">
              Amount received exceeds the{" "}
              {hasCarry ? "total due now" : "outstanding balance"} by{" "}
              {money(summary.amount - summary.dueNow)}. The excess will be
              recorded as unused credit.
            </Text>
          </Box>
        )}
      </Stack>
    </SectionCard>
  );
}

function Field({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Box>
      <Text fontSize="11px" color="gray.300" mb="1">
        {label}
      </Text>
      <Text
        fontSize="13px"
        fontWeight={strong ? "700" : "500"}
        color="gray.500"
      >
        {value}
      </Text>
    </Box>
  );
}

function Stat({
  label,
  value,
  color = "gray.500",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Flex direction="column" bg="gray.50" rounded="md" px="3" py="2.5" gap="1">
      <Text fontSize="11px" color="gray.300">
        {label}
      </Text>
      <Text fontSize="15px" fontWeight="600" color={color}>
        {value}
      </Text>
    </Flex>
  );
}
