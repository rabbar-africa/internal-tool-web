import { Box, Flex, Grid, Separator, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;

const formatDate = (v: string) => moment(v).format("DD MMM YYYY");

interface InvoicePdfViewProps {
  invoice: IInvoiceResponse;
}

export function InvoicePdfView({ invoice }: InvoicePdfViewProps) {
  const { formatMoney } = useFormatMoney();
  const client = invoice.client;
  const subtotal = toNum(invoice.subTotal);
  const discountAmount = toNum(invoice.discount);
  const taxAmount = toNum(invoice.taxAmount);
  const adjustment = toNum(invoice.adjustment);
  const total = toNum(invoice.total);
  const balance = toNum(invoice.balance);
  const amountPaid = total - balance;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="md"
      shadow="sm"
      p={{ base: "6", md: "10" }}
      maxW="900px"
      mx="auto"
      w="100%"
    >
      {/* Header — brand + INVOICE label */}
      <Flex justify="space-between" align="flex-start" mb="8" gap="6">
        <Stack gap="1">
          <Text fontSize="20px" fontWeight="700" color="gray.500">
            Rabbar Africa
          </Text>
          <Text fontSize="12px" color="gray.300">
            Lagos, Nigeria
          </Text>
        </Stack>
        <Stack gap="1" align="flex-end" textAlign="right">
          <Text
            fontSize="24px"
            fontWeight="700"
            color="primary.400"
            letterSpacing="0.05em"
          >
            INVOICE
          </Text>
          <Text fontSize="13px" color="gray.500" fontWeight="600">
            #{invoice.invoiceNumber}
          </Text>
          {invoice.referenceNumber && (
            <Text fontSize="11px" color="gray.300">
              Ref: {invoice.referenceNumber}
            </Text>
          )}
        </Stack>
      </Flex>

      {/* Bill To + Invoice meta */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="8">
        <Stack gap="1">
          <Text
            fontSize="10px"
            fontWeight="700"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb="1"
          >
            Bill To
          </Text>
          <Text fontSize="14px" fontWeight="600" color="gray.500">
            {client?.displayName ?? invoice.customerName ?? "—"}
          </Text>
          {client?.email && (
            <Text fontSize="12px" color="gray.400">
              {client.email}
            </Text>
          )}
          {client?.phone && (
            <Text fontSize="12px" color="gray.400">
              {client.phone}
            </Text>
          )}
          {invoice.billingAddress && (
            <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
              {invoice.billingAddress}
            </Text>
          )}
          {!invoice.billingAddress &&
            (client?.address || client?.city || client?.state) && (
              <Text fontSize="12px" color="gray.400">
                {[client.address, client.city, client.state, client.country]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
        </Stack>

        <Stack
          gap="1.5"
          bg="gray.25"
          p="4"
          rounded="md"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <MetaRow label="Invoice Date" value={formatDate(invoice.date)} />
          <MetaRow label="Due Date" value={formatDate(invoice.dueDate)} />
          <MetaRow
            label="Payment Terms"
            value={invoice.paymentTermsLabel || `Net ${invoice.paymentTerms}`}
          />
          {invoice.currencyCode && (
            <MetaRow label="Currency" value={invoice.currencyCode} />
          )}
        </Stack>
      </Grid>

      {/* Line items */}
      <Box
        borderWidth="1px"
        borderColor="gray.75"
        rounded="md"
        overflow="hidden"
        mb="6"
      >
        <Grid
          templateColumns="40px 1fr 70px 110px 120px"
          gap="3"
          px="4"
          py="3"
          bg="gray.25"
          borderBottomWidth="1px"
          borderColor="gray.75"
        >
          {["#", "Item & Description", "Qty", "Rate", "Amount"].map((h, i) => (
            <Text
              key={h}
              fontSize="10px"
              fontWeight="700"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="0.05em"
              textAlign={i >= 2 ? "right" : "left"}
            >
              {h}
            </Text>
          ))}
        </Grid>

        {invoice.lineItems?.map((li, idx) => (
          <Grid
            key={li.id}
            templateColumns="40px 1fr 70px 110px 120px"
            gap="3"
            px="4"
            py="3"
            borderBottomWidth={idx === invoice.lineItems.length - 1 ? 0 : "1px"}
            borderColor="gray.50"
          >
            <Text fontSize="12px" color="gray.300">
              {idx + 1}
            </Text>
            <Stack gap="0.5">
              <Text fontSize="13px" fontWeight="500" color="gray.500">
                {li.name}
              </Text>
              {li.description && (
                <Text fontSize="11px" color="gray.300">
                  {li.description}
                </Text>
              )}
            </Stack>
            <Text fontSize="12px" color="gray.500" textAlign="right">
              {toNum(li.quantity)}
            </Text>
            <Text fontSize="12px" color="gray.500" textAlign="right">
              {formatMoney(toNum(li.rate))}
            </Text>
            <Text
              fontSize="13px"
              fontWeight="500"
              color="gray.500"
              textAlign="right"
            >
              {formatMoney(toNum(li.total))}
            </Text>
          </Grid>
        ))}
      </Box>

      {/* Totals box */}
      <Flex justify="flex-end" mb="6">
        <Box
          w={{ base: "100%", md: "320px" }}
          borderWidth="1px"
          borderColor="gray.75"
          rounded="md"
          overflow="hidden"
        >
          <Stack gap="0" px="4" py="3">
            <TotalRow label="Subtotal" value={formatMoney(subtotal)} />
            {discountAmount > 0 && (
              <TotalRow
                label="Discount"
                value={`− ${formatMoney(discountAmount)}`}
                valueColor="red.500"
              />
            )}
            <TotalRow label="Tax" value={formatMoney(taxAmount)} />
            {adjustment !== 0 && (
              <TotalRow
                label={invoice.adjustmentDescription || "Adjustment"}
                value={`${adjustment > 0 ? "+" : "−"} ${formatMoney(Math.abs(adjustment))}`}
                valueColor={adjustment > 0 ? "green.600" : "red.500"}
              />
            )}
            <Separator my="2" />
            <Flex justify="space-between" align="center" py="1">
              <Text fontSize="14px" fontWeight="700" color="gray.500">
                Total
              </Text>
              <Text fontSize="16px" fontWeight="700" color="primary.400">
                {formatMoney(total)}
              </Text>
            </Flex>
            {amountPaid > 0 && (
              <TotalRow
                label="Amount Paid"
                value={`− ${formatMoney(amountPaid)}`}
                valueColor="green.600"
              />
            )}
            <Separator my="2" />
            <Flex justify="space-between" align="center" py="1">
              <Text fontSize="14px" fontWeight="700" color="gray.500">
                Balance Due
              </Text>
              <Text
                fontSize="16px"
                fontWeight="700"
                color={balance > 0 ? "red.500" : "green.600"}
              >
                {formatMoney(balance)}
              </Text>
            </Flex>
          </Stack>
        </Box>
      </Flex>

      {/* Notes + Terms */}
      {(invoice.notes || invoice.terms) && (
        <Stack gap="4" pt="2">
          {invoice.notes && (
            <Box>
              <Text
                fontSize="10px"
                fontWeight="700"
                color="gray.300"
                textTransform="uppercase"
                letterSpacing="0.08em"
                mb="1"
              >
                Notes
              </Text>
              <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
                {invoice.notes}
              </Text>
            </Box>
          )}
          {invoice.terms && (
            <Box>
              <Text
                fontSize="10px"
                fontWeight="700"
                color="gray.300"
                textTransform="uppercase"
                letterSpacing="0.08em"
                mb="1"
              >
                Terms & Conditions
              </Text>
              <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
                {invoice.terms}
              </Text>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" gap="3">
      <Text fontSize="11px" color="gray.300" fontWeight="500">
        {label}
      </Text>
      <Text fontSize="12px" color="gray.500" fontWeight="500" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
}

function TotalRow({
  label,
  value,
  valueColor = "gray.500",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Flex justify="space-between" align="center" py="1">
      <Text fontSize="13px" color="gray.400">
        {label}
      </Text>
      <Text fontSize="13px" color={valueColor} fontWeight="500">
        {value}
      </Text>
    </Flex>
  );
}
