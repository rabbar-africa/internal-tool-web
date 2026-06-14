import { Box, Flex, Grid, Image, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatAddress } from "@/utils/string-formatter";
import type { IPaymentReceived } from "@/shared/interface/payment";
import { Link } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v?: string) => (v ? moment(v).format("DD MMM YYYY") : "—");

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Cheque",
  ONLINE: "Online",
  OTHER: "Other",
};

// status → { label, ribbon bg }
const ribbonFor = (status: string) => {
  const s = (status || "").toUpperCase();
  if (["CONFIRMED", "COMPLETED", "PAID"].includes(s))
    return { label: "Paid", bg: "#1fcd6d" };
  if (["REFUNDED", "PARTIALLY_REFUNDED", "FAILED"].includes(s))
    return { label: s === "FAILED" ? "Failed" : "Refunded", bg: "error.300" };
  return { label: "Draft", bg: "gray.300" };
};

interface PaymentReceiptProps {
  payment: IPaymentReceived;
}

export function PaymentReceipt({ payment }: PaymentReceiptProps) {
  const { userOrganization } = useCurrentUser();
  const { formatMoney } = useFormatMoney();
  const money = (n: number) =>
    formatMoney(n, { currencyCode: payment.currencyCode });

  const orgAddress = formatAddress(userOrganization?.primaryAddress);
  const orgLocation = [userOrganization?.city, userOrganization?.country]
    .filter(Boolean)
    .join(", ");

  const allocations = payment.allocations ?? [];
  const outstanding = allocations.reduce(
    (sum, a) => sum + toNum(a.invoiceBalanceAfter),
    0,
  );
  const customerName =
    payment.customerName || payment.client?.displayName || "—";
  const ribbon = ribbonFor(payment.status);

  return (
    <Box
      position="relative"
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      maxW="860px"
      mx="auto"
      w="100%"
      overflow="hidden"
      px={{ base: "6", md: "12" }}
      py={{ base: "8", md: "12" }}
    >
      {/* Status ribbon */}
      <Box
        position="absolute"
        top="20px"
        left="-34px"
        transform="rotate(-45deg)"
        bg={ribbon.bg}
        color="white"
        px="12"
        py="1"
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.5px"
        textAlign="center"
        boxShadow="sm"
        // ackground-color: ;
        // border-color: #18a155;
      >
        {ribbon.label}
      </Box>

      {/* Org header */}
      <Flex gap="6" align="flex-start" mb="10">
        {userOrganization?.logoUrl ? (
          <Image
            src={userOrganization.logoUrl}
            alt={userOrganization?.name}
            maxH="96px"
            maxW="150px"
            objectFit="contain"
          />
        ) : (
          <Flex
            boxSize="96px"
            bg="primary.500"
            rounded="md"
            align="center"
            justify="center"
          >
            <Text fontSize="lg" color="white" fontWeight="700">
              {userOrganization?.name?.[0] ?? "R"}
            </Text>
          </Flex>
        )}
        <Stack gap="1" pt="1">
          <Text fontSize="20px" fontWeight="700" color="gray.500">
            {userOrganization?.name ?? "—"}
          </Text>
          {(orgAddress || orgLocation) && (
            <Text fontSize="12px" color="gray.300" whiteSpace="pre-line">
              {orgAddress || orgLocation}
            </Text>
          )}
          {(userOrganization?.companyEmail || userOrganization?.email) && (
            <Text fontSize="12px" color="gray.300">
              {userOrganization?.companyEmail || userOrganization?.email}
            </Text>
          )}
        </Stack>
      </Flex>

      <Box borderTopWidth="1px" borderColor="gray.75" pt="8">
        <Text
          textAlign="center"
          fontSize="15px"
          letterSpacing="2px"
          color="gray.400"
          fontWeight="500"
          mb="8"
        >
          PAYMENT RECEIPT
        </Text>

        {/* Details + amount box */}
        <Grid
          templateColumns={{ base: "1fr", md: "1.4fr 1fr" }}
          gap="8"
          mb="10"
        >
          <Stack gap="0">
            <DetailRow label="Receipt #" value={payment.paymentNumber || "—"} />
            <DetailRow label="Payment Date" value={formatDate(payment.date)} />
            {/* <DetailRow
              label="Reference Number"
              value={payment.referenceNumber || "—"}
            /> */}
            <DetailRow
              label="Payment Mode"
              value={MODE_LABELS[payment.mode] ?? payment.mode}
            />
            <DetailRow
              label="Outstanding Balance"
              value={money(outstanding)}
              last
            />
          </Stack>

          <Flex
            bg="success.200"
            rounded="sm"
            direction="column"
            align="center"
            justify="center"
            py={{ base: "6", md: "12" }}
            px="4"
            h="fit-content"
          >
            <Text fontSize="14px" color="white" opacity={0.9} mb="1">
              Amount Received
            </Text>
            <Text fontSize="24px" fontWeight="700" color="white">
              {money(toNum(payment.amount))}
            </Text>
          </Flex>
        </Grid>

        {/* Received from */}
        <Stack gap="1" mb="10">
          <Text fontSize="12px" color="gray.400">
            Received From
          </Text>
          <Link
            to={RouteConstants.customers.detail.generate({
              id: payment?.customerId,
            })}
          >
            <Text fontSize="16px" fontWeight="700" color="primary.300">
              {customerName}
            </Text>
          </Link>
        </Stack>

        {/* Payment for */}
        {allocations.length > 0 && (
          <Box>
            <Text fontSize="15px" fontWeight="700" color="gray.500" mb="3">
              Payment for
            </Text>
            <Box
              borderWidth="1px"
              borderColor="gray.75"
              rounded="lg"
              overflow="hidden"
            >
              <Grid
                templateColumns="1.2fr 1fr 1fr 1fr"
                bg="gray.50"
                px="4"
                py="2.5"
                gap="3"
              >
                {[
                  "Invoice Number",
                  "Invoice Date",
                  "Invoice Amount",
                  "Payment Amount",
                ].map((h, i) => (
                  <Text
                    key={h}
                    fontSize="11px"
                    fontWeight="600"
                    color="gray.400"
                    textAlign={i >= 2 ? "right" : "left"}
                  >
                    {h}
                  </Text>
                ))}
              </Grid>
              {allocations.map((a) => (
                <Grid
                  key={a.id}
                  templateColumns="1.2fr 1fr 1fr 1fr"
                  px="4"
                  py="3"
                  gap="3"
                  borderTopWidth="1px"
                  borderColor="gray.75"
                  alignItems="center"
                >
                  <Text fontSize="14px" fontWeight="600" color="primary.300">
                    {a.invoice?.invoiceNumber ?? "—"}
                  </Text>
                  <Text fontSize="14px" color="gray.400">
                    {formatDate(a.invoice?.date)}
                  </Text>
                  <Text fontSize="14px" color="gray.500" textAlign="right">
                    {money(toNum(a.invoice?.total))}
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="gray.500"
                    textAlign="right"
                  >
                    {money(toNum(a.amountApplied))}
                  </Text>
                </Grid>
              ))}
            </Box>
          </Box>
        )}

        {/* Notes */}
        {payment.notes && (
          <Box mt="8">
            <Text fontSize="12px" fontWeight="600" color="gray.400" mb="1.5">
              Notes
            </Text>
            <Text
              fontSize="14px"
              color="gray.400"
              whiteSpace="pre-line"
              lineHeight="1.6"
            >
              {payment.notes}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap="6"
      py="3"
      borderBottomWidth={last ? "0" : "1px"}
      borderColor="gray.75"
    >
      <Text fontSize="14px" color="gray.300">
        {label}
      </Text>
      <Text fontSize="14px" fontWeight="600" color="gray.500" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
}
