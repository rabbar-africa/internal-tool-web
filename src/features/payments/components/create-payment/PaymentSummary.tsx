import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { useFormatMoney } from "@/hooks/useFormatMoney";

interface PaymentSummaryProps {
  currencyCode: string;
  totals: {
    amount: number;
    amountApplied: number;
    unusedAmount: number;
    overApplied: boolean;
  };
}

export function PaymentSummary({ currencyCode, totals }: PaymentSummaryProps) {
  const { formatMoney } = useFormatMoney();
  const money = (n: number) => formatMoney(n, { currencyCode });

  return (
    <Flex justify="flex-end">
      <Stack
        gap="0"
        w={{ base: "100%", md: "320px" }}
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        p="4"
        bg="gray.50"
      >
        <Row label="Amount Received" value={money(totals.amount)} />
        <Row label="Amount Applied" value={money(totals.amountApplied)} />
        <Box h="1px" bg="gray.75" my="2" />
        <Flex justify="space-between" align="center">
          <Text fontSize="13px" fontWeight="700" color="gray.500">
            {totals.overApplied ? "Over-applied" : "Amount in Excess"}
          </Text>
          <Text
            fontSize="14px"
            fontWeight="700"
            color={totals.overApplied ? "error.300" : "gray.500"}
          >
            {money(Math.abs(totals.unusedAmount))}
          </Text>
        </Flex>
        {totals.overApplied && (
          <Text fontSize="11px" color="error.300" mt="2">
            Allocated amount exceeds the amount received. Reduce the
            allocations.
          </Text>
        )}
      </Stack>
    </Flex>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" align="center" py="1.5">
      <Text fontSize="13px" color="gray.400">
        {label}
      </Text>
      <Text fontSize="13px" fontWeight="500" color="gray.500">
        {value}
      </Text>
    </Flex>
  );
}
