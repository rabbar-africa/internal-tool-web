import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { SectionCard } from "./SectionCard";

interface InvoicePreviewProps {
  summary: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerName: string;
    currencyCode: string;
    total: number;
    balance: number;
    amount: number;
    balanceAfter: number;
    overpaid: boolean;
  };
}

export function InvoicePreview({ summary }: InvoicePreviewProps) {
  const { formatMoney } = useFormatMoney();
  const money = (n: number) =>
    formatMoney(n, { currencyCode: summary.currencyCode });
  const date = (v: string) => (v ? moment(v).format("DD MMM YYYY") : "—");

  return (
    <SectionCard
      step={1}
      title="Invoice"
      subtitle="You're recording a payment for this invoice"
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
            label="Outstanding Balance"
            value={money(summary.balance)}
            color="orange.600"
          />
          <Stat
            label="Balance After Payment"
            value={money(summary.balanceAfter)}
            color={summary.balanceAfter <= 0 ? "green.600" : "gray.500"}
          />
        </Grid>

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
              Amount received exceeds the outstanding balance by{" "}
              {money(summary.amount - summary.balance)}. The excess will be
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
