import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import Status from "@/components/ui/Status";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { pascalToCapitalized } from "@/utils/string-formatter";
import type { IPaymentReceived } from "@/shared/interface/payment";

interface ConnectedPaymentsProps {
  payments: IPaymentReceived[];
  invoiceId: string;
  onViewPayment: (paymentId: string) => void;
}

/** Amount a given payment applied to this specific invoice. */
function appliedToInvoice(payment: IPaymentReceived, invoiceId: string) {
  const allocation = payment.allocations?.find(
    (a) => a.invoiceId === invoiceId,
  );
  return Number(allocation?.amountApplied ?? payment.amountApplied ?? 0) || 0;
}

export function ConnectedPayments({
  payments,
  invoiceId,
  onViewPayment,
}: ConnectedPaymentsProps) {
  const { formatMoney } = useFormatMoney();

  if (!payments.length) return null;

  const totalApplied = payments.reduce(
    (sum, p) => sum + appliedToInvoice(p, invoiceId),
    0,
  );

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align="center"
        px={{ base: "4", md: "5" }}
        py="3"
        borderBottomWidth="1px"
        borderColor="gray.75"
        bg="gray.25"
      >
        <Text textStyle="small-semibold" color="gray.500">
          Payments Received ({payments.length})
        </Text>
        <Text textStyle="small-semibold" color="green.600">
          {formatMoney(totalApplied)}
        </Text>
      </Flex>

      <Stack gap="0">
        {payments.map((payment, idx) => (
          <Flex
            key={payment.id}
            justify="space-between"
            align="center"
            gap="3"
            px={{ base: "4", md: "5" }}
            py="3"
            cursor="pointer"
            borderTopWidth={idx === 0 ? "0" : "1px"}
            borderColor="gray.50"
            _hover={{ bg: "gray.25" }}
            onClick={() => onViewPayment(payment.id)}
          >
            <Stack gap="0.5" minW={0}>
              <Text textStyle="small-semibold" color="primary.400">
                {payment.paymentNumber}
              </Text>
              <Text textStyle="tiny-regular" color="gray.300">
                {moment(payment.date).format("DD MMM YYYY")}
                {payment.mode
                  ? ` · ${pascalToCapitalized(payment.mode.toLowerCase())}`
                  : ""}
              </Text>
            </Stack>

            <Flex align="center" gap="3" flexShrink={0}>
              <Text textStyle="small-semibold" color="gray.500">
                {formatMoney(appliedToInvoice(payment, invoiceId))}
              </Text>
              {payment.status && (
                <Status name={payment.status} h="1.5rem" w="auto" px="2.5" />
              )}
            </Flex>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}
