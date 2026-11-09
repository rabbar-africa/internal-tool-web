import { Center, type BoxProps } from "@chakra-ui/react";
import type { QuotationDisplayStatus } from "@/shared/interface/quotation";
import { QUOTATION_STATUS_LABELS } from "../utils/quotation-status";

const COLORS: Record<QuotationDisplayStatus, { bg: string; color: string }> = {
  DRAFT: { bg: "gray.50", color: "gray.400" },
  SENT: { bg: "blue.50", color: "blue.700" },
  ACCEPTED: { bg: "success.50", color: "success.300" },
  DECLINED: { bg: "error.50", color: "error.300" },
  EXPIRED: { bg: "warning.50", color: "warning.500" },
  INVOICED: { bg: "purple.50", color: "purple.700" },
  VOID: { bg: "gray.50", color: "gray.300" },
};

/** The quote's `displayStatus`, never its saved `status`. */
export function QuotationStatusBadge({
  status,
  ...props
}: { status?: string | null } & BoxProps) {
  const key = (status ?? "DRAFT").toUpperCase() as QuotationDisplayStatus;
  const colors = COLORS[key] ?? COLORS.DRAFT;
  return (
    <Center
      bg={colors.bg}
      color={colors.color}
      rounded="full"
      h="1.75rem"
      px="3"
      minW="5rem"
      fontWeight={600}
      fontSize=".6875rem"
      textDecoration={key === "VOID" ? "line-through" : undefined}
      whiteSpace="nowrap"
      {...props}
    >
      {QUOTATION_STATUS_LABELS[key] ?? status}
    </Center>
  );
}
