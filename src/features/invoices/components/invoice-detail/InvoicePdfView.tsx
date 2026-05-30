import { Box, Flex, Grid, Image, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v: string) => moment(v).format("DD MMM YYYY");

interface InvoicePdfViewProps {
  invoice: IInvoiceResponse;
}

export function InvoicePdfView({ invoice }: InvoicePdfViewProps) {
  const { formatMoney } = useFormatMoney();
  const { userOrganization } = useCurrentUser();

  const client = invoice.client;
  const subtotal = toNum(invoice.subTotal);
  const discountAmount = toNum(invoice.discount);
  const taxAmount = toNum(invoice.taxAmount);
  const total = toNum(invoice.total);
  const balance = toNum(invoice.balance);

  const orgLocation = [userOrganization?.city, userOrganization?.country]
    .filter(Boolean)
    .join(" , ");

  const formatPlain = (n: number) => formatMoney(n, { showSymbol: false });
  const formatWithCode = (n: number) =>
    formatMoney(n, { showCurrencyCode: true, showSymbol: false });

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="md"
      shadow="sm"
      px={{ base: "6", md: "12" }}
      py={{ base: "6", md: "12" }}
      maxW="900px"
      mx="auto"
      w="100%"
    >
      {/* Top: brand (left) + Invoice + Balance Due (right) */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="10">
        <Stack gap="3">
          {userOrganization?.logoUrl ? (
            <Image
              src={userOrganization.logoUrl}
              alt={userOrganization.name}
              maxH="80px"
              maxW="120px"
              objectFit="contain"
              alignSelf="flex-start"
            />
          ) : (
            <Box
              w="80px"
              h="80px"
              bg="primary.500"
              rounded="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="13px" color="white" fontWeight="600">
                {userOrganization?.name?.[0] ?? "R"}
              </Text>
            </Box>
          )}
          <Stack gap="0.5">
            <Text fontSize="14px" fontWeight="700" color="gray.500">
              {userOrganization?.name ?? "—"}
            </Text>
            {orgLocation && (
              <Text fontSize="12px" color="gray.400">
                {orgLocation}
              </Text>
            )}
            {userOrganization?.companyEmail || userOrganization?.email ? (
              <Text fontSize="12px" color="gray.400">
                {userOrganization?.companyEmail || userOrganization?.email}
              </Text>
            ) : null}
          </Stack>
        </Stack>

        <Stack gap="2" align="flex-end" textAlign="right">
          <Text
            fontSize={{ base: "32px", md: "40px" }}
            fontWeight="600"
            color="gray.500"
            lineHeight="1"
          >
            Invoice
          </Text>
          <Text fontSize="13px" color="gray.500" fontWeight="600">
            # {invoice.invoiceNumber}
          </Text>
          <Box mt="4">
            <Text fontSize="12px" color="gray.300" fontWeight="500">
              Balance Due
            </Text>
            <Text fontSize="20px" fontWeight="700" color="gray.500" mt="0.5">
              {formatWithCode(balance)}
            </Text>
          </Box>
        </Stack>
      </Grid>

      {/* Bill To (left) + Invoice meta (right) */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="6">
        <Stack gap="1" justify="flex-end">
          <Text fontSize="12px" color="gray.400">
            Bill To
          </Text>
          <Text fontSize="14px" fontWeight="700" color="gray.500">
            {client?.displayName ?? invoice.customerName ?? "—"}
          </Text>
          {invoice.billingAddress && (
            <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
              {invoice.billingAddress}
            </Text>
          )}
        </Stack>

        <Stack gap="2" justify="flex-end">
          <MetaRow label="Invoice Date" value={formatDate(invoice.date)} />
          <MetaRow
            label="Terms"
            value={invoice.paymentTermsLabel || `Net ${invoice.paymentTerms}`}
          />
          <MetaRow label="Due Date" value={formatDate(invoice.dueDate)} />
        </Stack>
      </Grid>

      {/* Line items */}
      <Box mb="6">
        <Grid
          templateColumns="50px 1fr 90px 130px 130px"
          gap="3"
          px="4"
          py="3"
          bg="gray.500"
        >
          {["#", "Item & Description", "Qty", "Rate", "Amount"].map((h, i) => (
            <Text
              key={h}
              fontSize="12px"
              fontWeight="500"
              color="white"
              textAlign={i >= 2 ? "right" : "left"}
            >
              {h}
            </Text>
          ))}
        </Grid>

        {invoice.lineItems?.map((li, idx) => (
          <Grid
            key={li.id}
            templateColumns="50px 1fr 90px 130px 130px"
            gap="3"
            px="4"
            py="4"
            borderBottomWidth="1px"
            borderColor="gray.75"
            alignItems="start"
          >
            <Text fontSize="13px" color="primary.400" fontWeight="500">
              {idx + 1}
            </Text>
            <Stack gap="0.5">
              <Text fontSize="13px" fontWeight="600" color="gray.500">
                {li.name}
              </Text>
              {li.description && (
                <Text fontSize="12px" color="gray.300">
                  {li.description}
                </Text>
              )}
            </Stack>
            <Text
              fontSize="13px"
              color="primary.400"
              textAlign="right"
              fontWeight="500"
            >
              {Number(li.quantity).toFixed(2)}
            </Text>
            <Text
              fontSize="13px"
              color="primary.400"
              textAlign="right"
              fontWeight="500"
            >
              {formatPlain(toNum(li.rate))}
            </Text>
            <Text fontSize="13px" color="gray.500" textAlign="right">
              {formatPlain(toNum(li.total))}
            </Text>
          </Grid>
        ))}
      </Box>

      {/* Totals — right-aligned, no outer box */}
      <Flex justify="flex-end" mb="10">
        <Stack gap="0" w={{ base: "100%", md: "360px" }}>
          <TotalRow label="Sub Total" value={formatPlain(subtotal)} />
          {discountAmount > 0 && (
            <TotalRow
              label="Discount"
              value={`(-) ${formatPlain(discountAmount)}`}
            />
          )}
          {taxAmount > 0 && (
            <TotalRow label="VAT" value={formatPlain(taxAmount)} />
          )}
          <TotalRow
            label="Total"
            value={formatWithCode(total)}
            labelBold
            valueBold
          />
          <Box bg="gray.50" px="3" py="3" rounded="sm" mt="1">
            <Flex justify="space-between" align="center">
              <Text fontSize="13px" fontWeight="700" color="gray.500">
                Balance Due
              </Text>
              <Text fontSize="14px" fontWeight="700" color="gray.500">
                {formatWithCode(balance)}
              </Text>
            </Flex>
          </Box>
        </Stack>
      </Flex>

      {/* Notes */}
      {invoice.notes && (
        <Box mb="6">
          <Text fontSize="13px" fontWeight="600" color="primary.400" mb="2">
            Notes
          </Text>
          <Text
            fontSize="12px"
            color="gray.400"
            whiteSpace="pre-line"
            lineHeight="1.6"
          >
            {invoice.notes}
          </Text>
        </Box>
      )}

      {/* Terms */}
      {invoice.terms && (
        <Box>
          <Text fontSize="13px" fontWeight="600" color="primary.400" mb="2">
            Terms &amp; Conditions
          </Text>
          <Text
            fontSize="12px"
            color="gray.400"
            whiteSpace="pre-line"
            lineHeight="1.6"
          >
            {invoice.terms}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="flex-end" gap="6" align="center">
      <Text fontSize="13px" color="gray.400">
        {label} :
      </Text>
      <Text
        fontSize="13px"
        color="primary.400"
        fontWeight="500"
        minW="120px"
        textAlign="right"
      >
        {value}
      </Text>
    </Flex>
  );
}

function TotalRow({
  label,
  value,
  labelBold,
  valueBold,
}: {
  label: string;
  value: string;
  labelBold?: boolean;
  valueBold?: boolean;
}) {
  return (
    <Flex justify="space-between" align="center" px="3" py="2">
      <Text
        fontSize="13px"
        color="gray.500"
        fontWeight={labelBold ? "700" : "400"}
      >
        {label}
      </Text>
      <Text
        fontSize="13px"
        color="gray.500"
        fontWeight={valueBold ? "700" : "500"}
      >
        {value}
      </Text>
    </Flex>
  );
}
