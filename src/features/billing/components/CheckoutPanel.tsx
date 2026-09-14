import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Flex,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { CustomInput } from "@/components/input";
import { getErrorMessage } from "@/utils/handle-error";
import { useCheckoutMutation, useCheckoutPreviewQuery } from "../api/query";
import type { BillingPlan } from "../api/types";
import { formatPrice } from "../utils/format";

interface CheckoutPanelProps {
  plan: BillingPlan;
  title: string;
  note: string;
  /** A saved card already exists — don't offer to save another. */
  hasCard: boolean;
  /** Called when a promo made the plan free and it activated right away. */
  onActivated?: () => void;
}

function PriceRow({
  label,
  value,
  strong = false,
  color = "gray.500",
}: {
  label: string;
  value: string;
  strong?: boolean;
  color?: string;
}) {
  return (
    <Flex justify="space-between" gap="4" align="baseline">
      <Text
        fontSize={strong ? "15px" : "14px"}
        fontWeight={strong ? "700" : "400"}
        color={strong ? "gray.500" : "gray.400"}
      >
        {label}
      </Text>
      <Text
        fontSize={strong ? "1.25rem" : "14px"}
        fontWeight={strong ? "700" : "500"}
        color={color}
        whiteSpace="nowrap"
      >
        {value}
      </Text>
    </Flex>
  );
}

/** Price breakdown, optional promo code, and the Pay button. */
export function CheckoutPanel({
  plan,
  title,
  note,
  hasCard,
  onActivated,
}: CheckoutPanelProps) {
  const [showPromo, setShowPromo] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // The plain price is always priced; the promo one only once a code is applied,
  // so a bad code still leaves a price on screen.
  const base = useCheckoutPreviewQuery(plan.tier, "");
  const withCode = useCheckoutPreviewQuery(
    appliedCode ? plan.tier : null,
    appliedCode,
  );

  const checkout = useCheckoutMutation();
  const redirecting =
    checkout.isSuccess && checkout.data?.status === "redirect";

  const checkingCode = Boolean(appliedCode) && withCode.isFetching;
  const promoError =
    appliedCode && withCode.isError ? getErrorMessage(withCode.error) : null;
  const codeAccepted = Boolean(appliedCode && withCode.data);
  const preview = codeAccepted ? withCode.data : base.data;

  const applyPromo = (event: FormEvent) => {
    event.preventDefault();
    setAppliedCode(promoInput.trim().toUpperCase());
  };

  const removePromo = () => {
    setAppliedCode("");
    setPromoInput("");
  };

  const pay = () =>
    checkout.mutate(
      {
        planTier: plan.tier,
        ...(codeAccepted ? { promoCode: appliedCode } : {}),
        saveCard: hasCard ? false : saveCard,
      },
      {
        onSuccess: (result) => {
          if (result.status === "activated") onActivated?.();
        },
      },
    );

  const isFree = preview != null && preview.amount <= 0;

  return (
    <Box
      p={{ base: "4", md: "5" }}
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      bg="gray.50"
    >
      <Text fontSize="16px" fontWeight="700" color="gray.500">
        {title}
      </Text>
      <Text fontSize="13px" color="gray.400" mt="0.5">
        {note}
      </Text>

      <Box mt="4" minH="4.5rem">
        {base.isLoading ? (
          <Flex align="center" gap="2" color="gray.300">
            <Spinner size="sm" />
            <Text fontSize="13px">Working out your price…</Text>
          </Flex>
        ) : preview ? (
          <Stack gap="2">
            <PriceRow
              label={`${preview.plan.name} plan`}
              value={formatPrice(preview.listPrice, preview.currency)}
            />
            {preview.discountAmount > 0 && (
              <PriceRow
                label={
                  preview.promoDescription
                    ? `Discount (${preview.promoDescription})`
                    : "Discount"
                }
                value={`− ${formatPrice(preview.discountAmount, preview.currency)}`}
                color="success.300"
              />
            )}
            {preview.periodMonths > 1 && (
              <Text fontSize="12px" color="gray.400">
                Covers {preview.periodMonths} months.
              </Text>
            )}
            <Separator borderColor="gray.100" />
            <PriceRow
              label="Amount to pay"
              value={formatPrice(preview.amount, preview.currency)}
              strong
            />
          </Stack>
        ) : (
          <Text fontSize="13px" color="error.300" role="alert">
            {getErrorMessage(base.error) ||
              "We couldn't work out the price. Please try again."}
          </Text>
        )}
      </Box>

      <Box mt="4">
        {!showPromo && !appliedCode ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            px="0"
            py="1"
            h="auto"
            fontWeight="600"
            onClick={() => setShowPromo(true)}
          >
            Have a promo code?
          </Button>
        ) : (
          <form onSubmit={applyPromo} noValidate>
            <Flex gap="2" align="flex-end">
              <Box flex="1">
                <CustomInput
                  label="Promo code"
                  name="promoCode"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50"
                  inputProps={{
                    bg: "white",
                    maxLength: 32,
                    autoComplete: "off",
                    autoCapitalize: "characters",
                    "aria-invalid": promoError ? true : undefined,
                    "aria-describedby": "promo-code-status",
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="outline"
                h="2.5rem"
                py="0"
                disabled={!promoInput.trim()}
                loading={checkingCode}
              >
                Apply
              </Button>
            </Flex>
            <Box id="promo-code-status" aria-live="polite" mt="1.5">
              {promoError && (
                <Text fontSize="13px" color="error.300">
                  {promoError}
                </Text>
              )}
              {codeAccepted && (
                <Flex align="center" gap="2" wrap="wrap">
                  <Text fontSize="13px" color="success.300" fontWeight="600">
                    Code {appliedCode} applied.
                  </Text>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    px="0"
                    py="0"
                    h="auto"
                    fontSize="13px"
                    onClick={removePromo}
                  >
                    Remove
                  </Button>
                </Flex>
              )}
            </Box>
          </form>
        )}
      </Box>

      {!hasCard && !isFree && (
        <Box mt="4">
          <CustomCheckbox
            checked={saveCard}
            onCheckedChange={(details: {
              checked: boolean | "indeterminate";
            }) => setSaveCard(details.checked === true)}
            label="Save my card for automatic renewal"
            helperText="Only if you pay by card. Leave this unticked to pay by transfer each time."
          />
        </Box>
      )}

      <Button
        variant="accent"
        w="full"
        mt="5"
        onClick={pay}
        disabled={!preview || checkingCode}
        loading={checkout.isPending || redirecting}
        loadingText="Opening payment…"
      >
        {isFree
          ? "Activate for free"
          : `Pay ${formatPrice(preview?.amount ?? plan.monthlyPrice, preview?.currency ?? plan.currency)}`}
      </Button>
      {!isFree && (
        <Text fontSize="12px" color="gray.400" mt="2" textAlign="center">
          Next, choose bank transfer, USSD or card on Paystack's secure page.
        </Text>
      )}
    </Box>
  );
}
