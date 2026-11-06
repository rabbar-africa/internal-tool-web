import { PlanFeatureNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import type { IOrgTax } from "@/shared/interface/settings";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { CreateInvoiceFormValues } from "@/shared/interface/invoice";
import {
  discountForAmountToPay,
  NEGATIVE_TOTAL_MESSAGE,
} from "../../utils/invoice-summary";

interface Totals {
  subtotal: number;
  entityDiscount: number;
  taxVal: number;
  taxRate: number;
  adjustmentVal: number;
  total: number;
}

interface InvoiceFooterProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  totals: Totals;
  /** The organization's active taxes, for the whole-job tax picker. */
  taxes: IOrgTax[];
}

/**
 * "I just want them to pay 120,000": works out the discount that gets there, so
 * nobody has to, tax included. Only fills in the discount field, which stays
 * editable, so a later change to the items moves the total as normal.
 */
function AmountToPay({
  formik,
  totals,
}: {
  formik: FormikProps<CreateInvoiceFormValues>;
  totals: Totals;
}) {
  const { formatMoney } = useFormatMoney();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<{
    amount: number;
    discount: number;
    adjustmentChange: number;
  } | null>(null);

  const close = () => {
    setOpen(false);
    setAmount("");
    setError(null);
  };

  const apply = () => {
    const target = Number(amount);
    if (!target || target <= 0) {
      setError("Enter the amount the customer should pay.");
      return;
    }
    const result = discountForAmountToPay(target, {
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      adjustment: totals.adjustmentVal,
      isDiscountBeforeTax: formik.values.isDiscountBeforeTax,
    });
    if (!result.ok) {
      setError(
        result.reason === "above-total"
          ? `That's more than the total with no discount (${formatMoney(result.limit)}).`
          : `The lowest this invoice can go is ${formatMoney(result.limit)}.`,
      );
      return;
    }
    formik.setFieldValue("discount", String(result.discount));
    if (result.adjustment !== totals.adjustmentVal) {
      formik.setFieldValue("adjustment", String(result.adjustment));
    }
    setApplied({
      amount: target,
      discount: result.discount,
      adjustmentChange: result.adjustment - totals.adjustmentVal,
    });
    close();
  };

  if (totals.subtotal <= 0) return null;

  if (open) {
    return (
      <Stack gap="2" pt="3">
        <CustomNumberInput
          label="Amount to pay (₦)"
          placeholder="0.00"
          min={0}
          allowNegative={false}
          value={amount}
          onValueChange={(raw) => {
            setAmount(raw);
            setError(null);
          }}
          error={error ?? undefined}
          inputProps={{
            autoFocus: true,
            textAlign: "right",
            // Enter here means this box, not "save the invoice".
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                apply();
              }
            },
          }}
        />
        <Flex gap="2" justify="flex-end">
          <Button type="button" variant="ghost" size="xs" onClick={close}>
            Cancel
          </Button>
          <Button type="button" size="xs" onClick={apply}>
            Apply
          </Button>
        </Flex>
      </Stack>
    );
  }

  // Only while it's still true: editing the items afterwards moves the total.
  const stillApplied =
    applied && Math.abs(totals.total - applied.amount) < 0.005;

  return (
    <Box pt="2">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        px="1"
        color="primary.300"
        onClick={() => setOpen(true)}
      >
        Set amount to pay
      </Button>
      {stillApplied && (
        <Text fontSize="12px" color="gray.400" mt="1">
          {formatMoney(applied.discount)} discount applied, so the total is
          exactly {formatMoney(applied.amount)}.
          {Math.abs(applied.adjustmentChange) >= 0.005 &&
            " The adjustment moved by a few kobo to cover tax rounding."}
        </Text>
      )}
    </Box>
  );
}

export function InvoiceFooter({ formik, totals, taxes }: InvoiceFooterProps) {
  const { formatMoney } = useFormatMoney();
  const { hasFeature } = usePlanAccess();
  const { subtotal, entityDiscount, taxVal, adjustmentVal, total } = totals;

  const taxOptions = [
    { label: "No tax", value: "" },
    ...taxes.map((tax) => ({
      label: `${tax.name} (${Number(tax.rate)}%)`,
      value: tax.id,
    })),
  ];

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 360px" }}
      gap="8"
      p={{ base: "4", md: "6" }}
    >
      {/* Left: Notes + Terms */}
      <Stack gap="4">
        <CustomTextArea
          label="Customer Notes"
          placeholder="Add a note for your customer (visible on the invoice)"
          rows={4}
          name="notes"
          value={formik.values.notes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        <CustomTextArea
          label="Terms & Conditions"
          placeholder="Enter any terms and conditions"
          rows={4}
          name="terms"
          disabled={!hasFeature("invoiceTerms")}
          value={formik.values.terms}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        <PlanFeatureNotice feature="invoiceTerms" />
      </Stack>

      {/* Right: Totals */}
      <Box
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        overflow="hidden"
        alignSelf="start"
      >
        <Box
          px="4"
          py="3"
          bg="gray.25"
          borderBottomWidth="1px"
          borderColor="gray.75"
        >
          <Text fontSize="13px" fontWeight="600" color="gray.500">
            Invoice Summary
          </Text>
        </Box>

        <Stack gap="0" px="4" py="3">
          <Flex justify="space-between" align="center" py="2">
            <Text fontSize="13px" color="gray.400">
              Subtotal
            </Text>
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              {formatMoney(subtotal)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" py="2" gap="4">
            <Text fontSize="13px" color="gray.400" flexShrink={0}>
              Discount (₦)
            </Text>
            <Box w="120px">
              <CustomNumberInput
                placeholder="0"
                name="discount"
                value={formik.values.discount}
                onValueChange={(str) => formik.setFieldValue("discount", str)}
                onBlur={formik.handleBlur}
                min={0}
                inputProps={{ textAlign: "right", fontSize: "13px" }}
              />
            </Box>
          </Flex>

          {entityDiscount > 0 && (
            <Flex justify="flex-end">
              <Text fontSize="12px" color="red.400">
                − {formatMoney(entityDiscount)}
              </Text>
            </Flex>
          )}

          {/* Whole-job tax — charged once, after any discount. */}
          <Flex justify="space-between" align="center" py="2" gap="4">
            <Box flex="1" maxW="190px">
              <CustomSelect
                placeholder="No tax"
                options={taxOptions}
                value={formik.values.taxId ? [formik.values.taxId] : [""]}
                onChange={(opt: { value: string[] }) =>
                  formik.setFieldValue("taxId", opt?.value?.[0] ?? "")
                }
              />
            </Box>
            <Text fontSize="13px" color="gray.500">
              {taxVal > 0 ? `+ ${formatMoney(taxVal)}` : formatMoney(0)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" py="2" gap="4">
            <Box>
              <CustomInput
                placeholder="Label"
                name="adjustmentDescription"
                value={formik.values.adjustmentDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ fontSize: "11px", h: "24px", mt: "1" }}
              />
            </Box>
            <Box w="120px">
              <CustomNumberInput
                placeholder="0"
                name="adjustment"
                value={formik.values.adjustment}
                onValueChange={(str) => formik.setFieldValue("adjustment", str)}
                onBlur={formik.handleBlur}
                inputProps={{ textAlign: "right", fontSize: "13px" }}
              />
            </Box>
          </Flex>

          {adjustmentVal !== 0 && (
            <Flex justify="flex-end">
              <Text
                fontSize="12px"
                color={adjustmentVal > 0 ? "green.400" : "red.400"}
              >
                {adjustmentVal > 0 ? "+" : "−"}{" "}
                {formatMoney(Math.abs(adjustmentVal))}
              </Text>
            </Flex>
          )}

          <Separator my="2" />

          <Flex
            justify="space-between"
            align="center"
            py="2"
            bg="primary.50"
            mx="-4"
            px="4"
            rounded="md"
          >
            <Text fontSize="14px" fontWeight="700" color="gray.500">
              Total
            </Text>
            <Text
              fontSize="16px"
              fontWeight="700"
              color={total < 0 ? "red.400" : "primary.400"}
            >
              {formatMoney(total)}
            </Text>
          </Flex>

          {total < 0 && (
            <Text fontSize="12px" color="red.400" mt="2">
              {NEGATIVE_TOTAL_MESSAGE}
            </Text>
          )}

          <AmountToPay formik={formik} totals={totals} />
        </Stack>
      </Box>
    </Grid>
  );
}
