import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { formatCurrency } from "@/utils/calculations";
import type { TopDebtor } from "../../interface";

interface TopDebtorsPanelProps {
  data: TopDebtor[];
  currency?: string;
}

const DEBT_COLOR = "#C1665A";

export function TopDebtorsPanel({
  data,
  currency = "NGN",
}: TopDebtorsPanelProps) {
  const debtors = data.slice(0, 5);
  const max = Math.max(...debtors.map((d) => d.amountOwed), 1);

  return (
    <DashboardCard title="Top Debtors" subtitle="By amount owed">
      {debtors.length > 0 ? (
        <Stack gap="4" mt="1">
          {debtors.map((d) => (
            <Box key={d.customerId}>
              <Flex justify="space-between" gap="3" mb="1.5">
                <Text
                  fontSize="13px"
                  fontWeight="500"
                  color="gray.500"
                  truncate
                >
                  {d.customerName}
                </Text>
                <Text
                  fontSize="13px"
                  fontWeight="700"
                  color={DEBT_COLOR}
                  flexShrink={0}
                >
                  {formatCurrency(d.amountOwed, currency)}
                </Text>
              </Flex>
              <Box
                h="6px"
                bg={`${DEBT_COLOR}1F`}
                rounded="full"
                overflow="hidden"
              >
                <Box
                  h="full"
                  rounded="full"
                  bg={DEBT_COLOR}
                  width={`${Math.max((d.amountOwed / max) * 100, 2)}%`}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No outstanding debtors
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
