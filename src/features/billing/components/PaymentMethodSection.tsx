import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSwitch } from "@/components/input/CustomSwitch";
import { SectionTitle } from "@/features/settings/components/SectionTitle";
import {
  useAddCardMutation,
  useAutoRenewMutation,
  useRemoveCardMutation,
} from "../api/query";
import type { BillingOverview } from "../api/types";
import { formatCardBrand, formatLongDate } from "../utils/format";

interface PaymentMethodSectionProps {
  overview: BillingOverview;
  canManage: boolean;
}

/** Saved card and automatic renewal. A card is optional — transfer is fine. */
export function PaymentMethodSection({
  overview,
  canManage,
}: PaymentMethodSectionProps) {
  const { card, autoRenew, currentPeriodEnd } = overview;
  const [confirmRemove, setConfirmRemove] = useState(false);

  const addCard = useAddCardMutation();
  const removeCard = useRemoveCardMutation();
  const setAutoRenew = useAutoRenewMutation();

  const renewNote = autoRenew
    ? currentPeriodEnd
      ? `We'll charge this card on ${formatLongDate(currentPeriodEnd)}.`
      : "We'll charge this card when your plan is due."
    : "Off — we'll email you a payment link when your plan is due.";

  return (
    <Box>
      <SectionTitle
        title="How you pay"
        subtitle="You don't need a card. Each time your plan is due, you can pay by bank transfer, USSD or card."
      />

      {card ? (
        <Stack gap="4">
          <Flex
            p="4"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.75"
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            gap="3"
          >
            <Box>
              <Text fontSize="15px" fontWeight="600" color="gray.500">
                {formatCardBrand(card.brand)} card ending in {card.last4}
              </Text>
              <Text fontSize="13px" color="gray.300" mt="0.5">
                Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                {card.bank ? ` · ${card.bank}` : ""}
              </Text>
            </Box>
            {canManage && (
              <Button
                variant="outlineSecondary"
                size="sm"
                onClick={() => setConfirmRemove(true)}
              >
                Remove card
              </Button>
            )}
          </Flex>

          {canManage ? (
            <CustomSwitch
              checked={autoRenew}
              disabled={setAutoRenew.isPending}
              onCheckedChange={(details: { checked: boolean }) =>
                setAutoRenew.mutate(details.checked)
              }
              label="Renew automatically with this card"
              helperText={renewNote}
            />
          ) : (
            <Text fontSize="14px" color="gray.400">
              Automatic renewal is {autoRenew ? "on" : "off"}.
            </Text>
          )}
        </Stack>
      ) : canManage ? (
        <Box>
          <Button
            variant="outline"
            onClick={() => addCard.mutate()}
            loading={addCard.isPending || addCard.isSuccess}
            loadingText="Opening Paystack…"
            w={{ base: "full", sm: "auto" }}
          >
            Add a card for automatic renewal
          </Button>
          <Text fontSize="12px" color="gray.300" mt="2">
            Optional. We charge ₦50 to check the card, then refund it.
          </Text>
        </Box>
      ) : (
        <Text fontSize="14px" color="gray.400">
          No card saved. The plan is paid by transfer, USSD or card each time
          it's due.
        </Text>
      )}

      <ConsentDialog
        open={confirmRemove}
        onOpenChange={({ open }) => setConfirmRemove(open)}
        heading="Remove this card?"
        note="We won't charge it again. When your plan is due, we'll email you a payment link instead."
        confirmText="Yes, remove card"
        isLoading={removeCard.isPending}
        handleSubmit={() =>
          removeCard.mutate(undefined, {
            onSuccess: () => setConfirmRemove(false),
          })
        }
      />
    </Box>
  );
}
