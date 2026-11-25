import { Box, Flex, Text, type FlexProps } from "@chakra-ui/react";
import { getStatusColor } from "@/utils/get-color";

/** "PARTIALLY_PAID" → "Partially paid". */
export const humanizeStatus = (value: string) =>
  value.charAt(0).toUpperCase() +
  value.slice(1).toLowerCase().replace(/_/g, " ");

/**
 * "● Paid": a status as a small soft pill with a dot, in the list's colours
 * for it. Pass the raw status (an API enum or a word).
 */
export function StatusDot({
  status,
  label,
  ...props
}: { status: string; label?: string } & FlexProps) {
  const colors = getStatusColor(status) ?? { bg: "gray.50", text: "gray.400" };
  return (
    <Flex
      display="inline-flex"
      align="center"
      gap="1.5"
      px="2.5"
      py="1"
      rounded="full"
      bg={colors.bg}
      color={colors.text}
      flexShrink={0}
      {...props}
    >
      <Box boxSize="6px" rounded="full" bg="currentColor" />
      <Text fontSize="12px" fontWeight="500" whiteSpace="nowrap">
        {label ?? humanizeStatus(status)}
      </Text>
    </Flex>
  );
}
