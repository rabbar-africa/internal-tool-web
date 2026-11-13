import { Center, type BoxProps } from "@chakra-ui/react";
import type { CreditNoteStatus } from "@/shared/interface/credit-note";
import { CREDIT_NOTE_STATUS_LABELS } from "../utils/credit-note-status";

const COLORS: Record<CreditNoteStatus, { bg: string; color: string }> = {
  DRAFT: { bg: "gray.50", color: "gray.400" },
  OPEN: { bg: "blue.50", color: "blue.700" },
  CLOSED: { bg: "success.50", color: "success.300" },
  VOID: { bg: "gray.50", color: "gray.300" },
};

export function CreditNoteStatusBadge({
  status,
  ...props
}: { status?: string | null } & BoxProps) {
  const key = (status ?? "DRAFT").toUpperCase() as CreditNoteStatus;
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
      {CREDIT_NOTE_STATUS_LABELS[key] ?? status}
    </Center>
  );
}
