import { Box, Card, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = "primary.50",
  trend,
  trendValue,
}: StatCardProps) {
  const trendColor =
    trend === "up" ? "green.500" : trend === "down" ? "red.500" : "gray.400";

  return (
    <Card.Root
      bg="white"
      rounded="lg"
      boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
      borderWidth="1px"
      borderColor="gray.75"
      p="0"
    >
      <Card.Body p="5">
        <Flex align="flex-start" justify="space-between">
          <Box flex="1">
            <Text
              fontSize="12px"
              fontWeight="500"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="0.05em"
              mb="2"
            >
              {label}
            </Text>
            <Text
              fontSize="24px"
              fontWeight="500"
              color="gray.900"
              lineHeight="1"
            >
              {value}
            </Text>
            {trendValue && (
              <Text fontSize="12px" color={trendColor} mt="2" fontWeight="500">
                {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}{" "}
                {trendValue}
              </Text>
            )}
          </Box>
          <Flex
            boxSize={"2rem"}
            rounded="lg"
            bg={iconBg}
            align="center"
            justify="center"
            flexShrink={0}
            ml="3"
            p={".25rem"}
          >
            {icon}
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
