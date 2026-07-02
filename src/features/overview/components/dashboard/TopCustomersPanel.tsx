import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { formatCurrency } from "@/utils/calculations";
import type { TopCustomer } from "../../interface";

interface TopCustomersPanelProps {
  data: TopCustomer[];
  currency?: string;
}

export function TopCustomersPanel({
  data,
  currency = "NGN",
}: TopCustomersPanelProps) {
  const customers = data.slice(0, 5);
  const max = Math.max(...customers.map((c) => c.total), 1);

  return (
    <DashboardCard title="Top Customers" subtitle="By total billed">
      {customers.length > 0 ? (
        <Stack gap="4" mt="1">
          {customers.map((c) => (
            <Box key={c.customerId}>
              <Flex justify="space-between" gap="3" mb="1.5">
                <Text
                  fontSize="13px"
                  fontWeight="500"
                  color="gray.500"
                  truncate
                >
                  {c.customerName}
                </Text>
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="gray.500"
                  flexShrink={0}
                >
                  {formatCurrency(c.total, currency)}
                </Text>
              </Flex>
              <Box h="6px" bg="gray.75" rounded="full" overflow="hidden">
                <Box
                  h="full"
                  rounded="full"
                  bg="#293885"
                  opacity={0.85}
                  width={`${Math.max((c.total / max) * 100, 2)}%`}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No customer activity yet
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
