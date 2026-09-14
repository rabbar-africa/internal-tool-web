import type { ReactNode } from "react";
import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import { CheckCircle } from "@/assets/custom/CheckCircle";
import { WarningCircle } from "@/assets/custom/WarningCircle";

type MessageTone = "success" | "warning" | "error" | "pending";

const TONE: Record<MessageTone, { bg: string; color: string }> = {
  success: { bg: "success.50", color: "success.300" },
  warning: { bg: "warning.50", color: "warning.600" },
  error: { bg: "error.50", color: "error.300" },
  pending: { bg: "primary.50", color: "primary.400" },
};

interface BillingMessageProps {
  tone: MessageTone;
  title: string;
  body?: ReactNode;
  /** Buttons/links shown under the message. */
  actions?: ReactNode;
}

/** Big centred status message for the public billing pages. */
export function BillingMessage({
  tone,
  title,
  body,
  actions,
}: BillingMessageProps) {
  const style = TONE[tone];

  return (
    <Stack gap="5" align="center" textAlign="center" role="status">
      <Flex
        align="center"
        justify="center"
        boxSize="3.5rem"
        rounded="full"
        bg={style.bg}
        color={style.color}
      >
        {tone === "pending" ? (
          <Spinner size="md" />
        ) : tone === "success" ? (
          <CheckCircle boxSize="1.75rem" aria-hidden="true" />
        ) : (
          <WarningCircle boxSize="1.75rem" aria-hidden="true" />
        )}
      </Flex>
      <Stack gap="2">
        <Text as="h1" fontSize="1.375rem" fontWeight="700" color="gray.500">
          {title}
        </Text>
        {body && (
          <Text fontSize="15px" color="gray.400" lineHeight="1.6">
            {body}
          </Text>
        )}
      </Stack>
      {actions && (
        <Stack gap="3" w="100%">
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
