import { Box, Text } from "@chakra-ui/react";
import { getProfitStatus } from "@/utils/calculations";

interface ProfitBadgeProps {
  marginPercent: number;
  showPercent?: boolean;
}

const STATUS_STYLES: Record<
  ReturnType<typeof getProfitStatus>,
  { bg: string; color: string; label: string }
> = {
  profitable: { bg: "green.50", color: "green.600", label: "Profitable" },
  "low-margin": { bg: "yellow.50", color: "yellow.700", label: "Low Margin" },
  loss: { bg: "red.50", color: "red.600", label: "Loss" },
};

export function ProfitBadge({ marginPercent, showPercent }: ProfitBadgeProps) {
  const status = getProfitStatus(marginPercent);
  const styles = STATUS_STYLES[status];

  return (
    <Box
      display="inline-flex"
      bg={styles.bg}
      px="10px"
      py="4px"
      rounded="md"
      alignItems="center"
    >
      <Text fontSize="12px" fontWeight="500" color={styles.color}>
        {styles.label}
        {showPercent && ` (${marginPercent.toFixed(1)}%)`}
      </Text>
    </Box>
  );
}
