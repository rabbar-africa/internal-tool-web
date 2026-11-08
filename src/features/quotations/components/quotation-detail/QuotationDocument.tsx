import { Box, Flex, Grid, Image, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { formatAddress } from "@/utils/string-formatter";
import type { IQuotation } from "@/shared/interface/quotation";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDay = (v: string) => moment(v).format("DD MMM YYYY");

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="11px"
      fontWeight="600"
      color="gray.300"
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {children}
    </Text>
  );
}

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Flex justify="space-between" py="1.5" gap="4">
      <Text
        fontSize={strong ? "14px" : "13px"}
        fontWeight={strong ? "700" : "400"}
        color={strong ? "gray.500" : "gray.400"}
      >
        {label}
      </Text>
      <Text
        fontSize={strong ? "14px" : "13px"}
        fontWeight={strong ? "700" : "500"}
        color="gray.500"
      >
        {value}
      </Text>
    </Flex>
  );
}

/**
 * The quote as the customer will read it, on screen. The PDF the customer
 * gets is drawn by the API from the business's Estimate template.
 */
export function QuotationDocument({ quote }: { quote: IQuotation }) {
  const { formatMoney } = useFormatMoney();
  const { userOrganization } = useCurrentUser();

  const discount = toNum(quote.discount);
  const taxAmount = toNum(quote.taxAmount);
  const adjustment = toNum(quote.adjustment);
  const taxPercent = toNum(quote.taxPercent);
  const taxLabel = quote.taxName
    ? `${quote.taxName}${taxPercent ? ` (${taxPercent}%)` : ""}`
    : "Tax";
  const vehicle = quote.vehicle;
  const orgAddress = formatAddress(userOrganization?.primaryAddress);

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="md"
      shadow="sm"
      px={{ base: "5", md: "12" }}
      py={{ base: "6", md: "12" }}
      maxW="900px"
      mx="auto"
      w="100%"
    >
      <Flex
        justify="space-between"
        gap="6"
        direction={{ base: "column", sm: "row" }}
      >
        <Stack gap="1">
          {userOrganization?.logoUrl ? (
            <Image
              src={userOrganization.logoUrl}
              alt={userOrganization.name}
              maxH="56px"
              maxW="160px"
              objectFit="contain"
              mb="2"
            />
          ) : null}
          <Text fontWeight="700" color="gray.500">
            {userOrganization?.name ?? "—"}
          </Text>
          {orgAddress && (
            <Text fontSize="12px" color="gray.400">
              {orgAddress}
            </Text>
          )}
          {userOrganization?.email && (
            <Text fontSize="12px" color="gray.400">
              {userOrganization.email}
            </Text>
          )}
          {userOrganization?.phone && (
            <Text fontSize="12px" color="gray.400">
              {userOrganization.phone}
            </Text>
          )}
        </Stack>

        <Stack gap="1" textAlign={{ base: "left", sm: "right" }}>
          <Text
            fontSize={{ base: "22px", md: "28px" }}
            fontWeight="800"
            color="gray.500"
          >
            Quotation
          </Text>
          <Text fontSize="13px" color="gray.400">
            # {quote.quotationNumber}
          </Text>
          <Label>Amount</Label>
          <Text fontSize="18px" fontWeight="700" color="gray.500">
            {formatMoney(toNum(quote.total), { showCurrencyCode: true })}
          </Text>
        </Stack>
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
        gap="6"
        mt="8"
        pb="6"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        <Stack gap="1">
          <Label>Quote for</Label>
          <Text fontWeight="600" color="gray.500">
            {quote.customerName ?? quote.client?.displayName ?? "—"}
          </Text>
          {quote.client?.email && (
            <Text fontSize="12px" color="gray.400">
              {quote.client.email}
            </Text>
          )}
          {quote.client?.phone && (
            <Text fontSize="12px" color="gray.400">
              {quote.client.phone}
            </Text>
          )}
          {vehicle && (
            <Text fontSize="12px" color="gray.400" mt="1">
              {[vehicle.year, vehicle.make, vehicle.model]
                .filter(Boolean)
                .join(" ")}
              {vehicle.registrationNumber
                ? ` · ${vehicle.registrationNumber}`
                : ""}
            </Text>
          )}
        </Stack>
        <Grid
          templateColumns="auto 1fr"
          columnGap="4"
          rowGap="1"
          h="fit-content"
        >
          <Text fontSize="13px" color="gray.300">
            Quote Date
          </Text>
          <Text fontSize="13px" color="gray.500" textAlign="right">
            {formatDay(quote.date)}
          </Text>
          <Text fontSize="13px" color="gray.300">
            Valid Until
          </Text>
          <Text fontSize="13px" color="gray.500" textAlign="right">
            {quote.expiryDate ? formatDay(quote.expiryDate) : "No expiry"}
          </Text>
          {quote.referenceNumber && (
            <>
              <Text fontSize="13px" color="gray.300">
                Reference
              </Text>
              <Text fontSize="13px" color="gray.500" textAlign="right">
                {quote.referenceNumber}
              </Text>
            </>
          )}
        </Grid>
      </Grid>

      {/* Items */}
      <Box mt="6" overflowX="auto">
        <Grid
          templateColumns="28px minmax(180px, 1fr) 60px 110px 120px"
          gap="3"
          py="2"
          px="2"
          bg="gray.50"
          rounded="sm"
          minW="520px"
        >
          {["#", "Item", "Qty", "Rate", "Amount"].map((col, i) => (
            <Text
              key={col}
              fontSize="11px"
              fontWeight="600"
              color="gray.400"
              textTransform="uppercase"
              textAlign={i >= 2 ? "right" : "left"}
            >
              {col}
            </Text>
          ))}
        </Grid>
        {quote.lineItems.map((line, idx) => (
          <Grid
            key={line.id}
            templateColumns="28px minmax(180px, 1fr) 60px 110px 120px"
            gap="3"
            py="3"
            px="2"
            borderBottomWidth="1px"
            borderColor="gray.75"
            minW="520px"
          >
            <Text fontSize="13px" color="gray.300">
              {idx + 1}
            </Text>
            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.500">
                {line.name}
              </Text>
              {line.description && (
                <Text fontSize="12px" color="gray.300">
                  {line.description}
                </Text>
              )}
            </Box>
            <Text fontSize="13px" color="gray.400" textAlign="right">
              {toNum(line.quantity)}
            </Text>
            <Text fontSize="13px" color="gray.400" textAlign="right">
              {formatMoney(toNum(line.rate), { showSymbol: false })}
            </Text>
            <Text fontSize="13px" color="gray.500" textAlign="right">
              {formatMoney(toNum(line.total), { showSymbol: false })}
            </Text>
          </Grid>
        ))}
      </Box>

      {/* Totals */}
      <Flex justify="flex-end" mt="4">
        <Box w={{ base: "100%", sm: "300px" }}>
          <TotalRow
            label="Sub Total"
            value={formatMoney(toNum(quote.subTotal), { showSymbol: false })}
          />
          {discount > 0 && (
            <TotalRow
              label="Discount"
              value={`(-) ${formatMoney(discount, { showSymbol: false })}`}
            />
          )}
          {taxAmount > 0 && (
            <TotalRow
              label={taxLabel}
              value={formatMoney(taxAmount, { showSymbol: false })}
            />
          )}
          {adjustment !== 0 && (
            <TotalRow
              label={quote.adjustmentDescription || "Adjustment"}
              value={formatMoney(adjustment, { showSymbol: false })}
            />
          )}
          <Box borderTopWidth="1px" borderColor="gray.75" mt="1" pt="1">
            <TotalRow
              label="Total"
              value={formatMoney(toNum(quote.total), {
                showCurrencyCode: true,
                showSymbol: false,
              })}
              strong
            />
          </Box>
        </Box>
      </Flex>

      {(quote.notes || quote.terms) && (
        <Stack gap="4" mt="8">
          {quote.notes && (
            <Box>
              <Label>Notes</Label>
              <Text fontSize="13px" color="gray.400" whiteSpace="pre-wrap">
                {quote.notes}
              </Text>
            </Box>
          )}
          {quote.terms && (
            <Box>
              <Label>Terms &amp; Conditions</Label>
              <Text fontSize="13px" color="gray.400" whiteSpace="pre-wrap">
                {quote.terms}
              </Text>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
