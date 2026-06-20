import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { formatCurrency } from "@/utils/calculations";

interface CustomerStatsProps {
  totalPaid: number;
  outstanding: number;
  totalInvoices: number;
}

export function CustomerStats({
  totalPaid,
  outstanding,
  totalInvoices,
}: CustomerStatsProps) {
  const stats = [
    {
      label: "Total Paid",
      value: formatCurrency(totalPaid),
      accent: "green.500",
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding),
      accent: "orange.500",
    },
    {
      label: "Total Invoices",
      value: String(totalInvoices),
      accent: "primary.300",
    },
  ];

  return (
    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
      {stats.map((stat) => (
        <Box
          key={stat.label}
          bg="white"
          rounded="xl"
          px="5"
          py="4"
          borderWidth="1px"
          borderColor="gray.75"
          shadow="xs"
        >
          <Flex align="center" gap="3">
            <Box w="2" h="8" bg={stat.accent} rounded="full" />
            <Box>
              <Text fontSize="11px" color="gray.300" fontWeight="500">
                {stat.label}
              </Text>
              <Text fontSize="1.05rem" fontWeight="700" color="gray.600">
                {stat.value}
              </Text>
            </Box>
          </Flex>
        </Box>
      ))}
    </Grid>
  );
}
