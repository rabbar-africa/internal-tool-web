import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useCheckoutReturn } from "../hooks/useCheckoutReturn";
import { TONE_STYLES } from "../utils/copy";

/**
 * Only while a payment that just came back from Paystack is unconfirmed. A
 * settled one is a toast, so most people never see this.
 */
export function CheckoutReturnBanner() {
  const {
    isConfirming,
    isCardCheck,
    timedOut,
    isChecking,
    checkAgain,
    dismiss,
  } = useCheckoutReturn();
  if (!isConfirming) return null;

  const style = TONE_STYLES[timedOut ? "warning" : "neutral"];
  return (
    <Flex
      role="status"
      aria-live="polite"
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      gap="3"
      mb="6"
      px="4"
      py="3"
      rounded="lg"
      bg={style.bg}
      borderWidth="1px"
      borderColor={style.border}
    >
      <Flex align="flex-start" gap="3">
        {!timedOut && (
          <Spinner size="sm" color="primary.400" mt="0.125rem" flexShrink={0} />
        )}
        <Box>
          <Text textStyle="small-semibold" color="gray.500">
            {timedOut
              ? "We're still confirming your payment"
              : "Confirming your payment..."}
          </Text>
          <Text textStyle="small-regular" color="gray.400" mt="0.5">
            {isCardCheck
              ? "This can take a minute. We'll email you once your card is saved."
              : "Bank transfers can take a minute. We'll email you once it's confirmed."}
          </Text>
        </Box>
      </Flex>
      {timedOut && (
        <Flex gap="2" flexShrink={0}>
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Dismiss
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={isChecking}
            onClick={checkAgain}
          >
            Check again
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
