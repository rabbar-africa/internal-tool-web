import { Box, Text } from "@chakra-ui/react";
import type { PaperworkStatus } from "@/shared/interface/paperwork";
import { STATUS_META } from "../utils/paperwork";

interface PaperworkStatusBadgeProps {
  status: PaperworkStatus;
}

export function PaperworkStatusBadge({ status }: PaperworkStatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.NO_EXPIRY;

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      bg={meta.bg}
      px="10px"
      py="4px"
      rounded="md"
    >
      <Text fontSize="12px" fontWeight="500" color={meta.color}>
        {meta.label}
      </Text>
    </Box>
  );
}
