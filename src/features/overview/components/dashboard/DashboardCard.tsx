import { Box, Flex, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface DashboardCardProps extends BoxProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Subtle, consistent surface for every dashboard panel — soft border, barely
 * there shadow, generous padding. Keeps all cards visually in one family.
 */
export function DashboardCard({
  title,
  subtitle,
  action,
  children,
  ...rest
}: DashboardCardProps) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
      p={{ base: "4", md: "5" }}
      overflow="hidden"
      minW="0"
      {...rest}
    >
      {(title || action) && (
        <Flex justify="space-between" align="flex-start" gap="3" mb="4">
          <Box minW="0">
            {title && (
              <Box
                as="h3"
                fontSize="14px"
                fontWeight="600"
                color="gray.500"
                lineHeight="1.3"
              >
                {title}
              </Box>
            )}
            {subtitle && (
              <Box as="p" fontSize="12px" color="gray.300" mt="0.5">
                {subtitle}
              </Box>
            )}
          </Box>
          {action}
        </Flex>
      )}
      {children}
    </Box>
  );
}
