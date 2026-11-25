import { Box, Card, Flex, Skeleton, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CARD_SHADOW, FAINT_EDGE } from "@/theme/surfaces";

interface StatCardProps {
  label: string;
  value?: ReactNode;
  icon: ReactNode;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  /** Keeps the card, label and icon; only the figures shimmer. */
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = "primary.50",
  trend,
  trendValue,
  loading,
}: StatCardProps) {
  const trendColor =
    trend === "up" ? "green.500" : trend === "down" ? "red.500" : "gray.400";

  return (
    <Card.Root
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor={FAINT_EDGE}
      boxShadow={CARD_SHADOW}
      p="0"
    >
      <Card.Body p="5">
        <Flex align="flex-start" justify="space-between">
          <Box flex="1" minW="0">
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
            {loading ? (
              <>
                <Skeleton h="24px" w="8rem" rounded="md" />
                {/* Same height as the line it stands in for: no jump. */}
                <Skeleton h="12px" w="6rem" rounded="sm" mt="11px" mb="3px" />
              </>
            ) : (
              <>
                <Text
                  fontSize="24px"
                  fontWeight="500"
                  color="gray.900"
                  lineHeight="1"
                  fontVariantNumeric="tabular-nums"
                >
                  {value}
                </Text>
                {trendValue && (
                  <Text
                    fontSize="12px"
                    color={trendColor}
                    mt="2"
                    fontWeight="500"
                  >
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}{" "}
                    {trendValue}
                  </Text>
                )}
              </>
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
