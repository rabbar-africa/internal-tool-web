import { useMemo } from "react";
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import {
  useGetOrganizationDetails,
  useGetOrganizationTaxes,
} from "@/features/settings/api";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { Expense, ExpenseVatFields } from "@/shared/interface/expense";
import type { IOrgTax } from "@/shared/interface/settings";

/**
 * VAT paid on an expense (docs/frontend-vat.md). Only for a VAT-registered
 * business: otherwise nothing is shown and nothing is sent (the API refuses
 * VAT then).
 *
 * The price typed can be before VAT (the default: ₦100,000 + ₦7,500 VAT =
 * ₦107,500 paid) or include it (₦100,000 paid, ₦6,976.74 of it VAT). Either
 * way the API is sent what was paid, VAT included, and the VAT in it.
 */

/** Stands for "no VAT" in the select, which can't hold an empty value. */
const NONE = "__none__";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The VAT inside an amount paid VAT included: ₦10,750 at 7.5% → ₦750. */
export const vatInside = (amount: number, rate: number) =>
  amount > 0 && rate > 0 ? round2((amount * rate) / (100 + rate)) : 0;

/** The VAT on a price before VAT: ₦100,000 at 7.5% → ₦7,500. */
export const vatOnTop = (price: number, rate: number) =>
  price > 0 && rate > 0 ? round2((price * rate) / 100) : 0;

export interface VatValue {
  /** "" = no VAT. */
  taxId: string;
  /** Typed from the receipt; used only when `manual`. */
  taxAmount: string;
  manual: boolean;
  vatClaimable: boolean;
  /** The price typed already includes the VAT (else VAT is added on top). */
  priceIncludesVat: boolean;
}

export const EMPTY_VAT: VatValue = {
  taxId: "",
  taxAmount: "",
  manual: false,
  vatClaimable: true,
  priceIncludesVat: false,
};

/** The form's starting VAT for an expense being edited. */
export function vatFromExpense(expense?: Expense): VatValue {
  const tax = expense?.tax;
  if (!tax || !expense) return EMPTY_VAT;
  const paid = Number(expense.amount) || 0;
  const price =
    (Number(expense.quantity) || 0) * (Number(expense.unitCost) || 0);
  // Saved "before VAT", the amount paid is the price plus the VAT.
  const priceIncludesVat = !(paid - price > 0.005);
  // The API doesn't say whether the figure was typed; one that isn't what
  // the rate gives must have been.
  const worked = priceIncludesVat
    ? vatInside(paid, tax.percent)
    : vatOnTop(price, tax.percent);
  return {
    taxId: tax.id ?? "",
    taxAmount: String(tax.amount),
    manual: Math.abs(worked - tax.amount) > 0.01,
    vatClaimable: tax.claimable,
    priceIncludesVat,
  };
}

/** Whether the business records VAT on expenses, and the taxes to pick. */
export function useExpenseVat() {
  const { data: org } = useGetOrganizationDetails();
  const registered = Boolean(org?.data?.config?.vatRegistered);
  const { data } = useGetOrganizationTaxes({ enabled: registered });
  const taxes = useMemo<IOrgTax[]>(
    () =>
      (data?.data ?? [])
        .filter((t: IOrgTax) => t.isActive)
        // VAT first: that's what an expense almost always carries.
        .sort(
          (a: IOrgTax, b: IOrgTax) =>
            Number(b.type === "VAT") - Number(a.type === "VAT"),
        ),
    [data?.data],
  );
  return { registered, taxes };
}

export interface VatBreakdown {
  vat: number;
  /** What was paid, VAT included: what the API stores as the amount. */
  paid: number;
  /** The price before VAT. */
  net: number;
}

/** The VAT, the amount paid and the price before VAT, for a typed price. */
export function vatBreakdown(
  value: VatValue,
  price: number,
  taxes: IOrgTax[],
): VatBreakdown {
  const tax = taxes.find((t) => t.id === value.taxId);
  if (!value.taxId || (!tax && !value.manual)) {
    return { vat: 0, paid: price, net: price };
  }
  const rate = Number(tax?.rate ?? 0);
  const typed = Number(value.taxAmount) || 0;
  if (value.priceIncludesVat) {
    const vat = value.manual ? typed : vatInside(price, rate);
    return { vat, paid: price, net: round2(price - vat) };
  }
  const vat = value.manual ? typed : vatOnTop(price, rate);
  return { vat, paid: round2(price + vat), net: price };
}

/** Why the typed VAT can't be saved, or nothing. */
export function vatError(value: VatValue, price: number): string | undefined {
  if (!value.taxId || !value.manual) return undefined;
  const typed = Number(value.taxAmount);
  if (value.taxAmount === "" || Number.isNaN(typed)) return "Enter the VAT";
  if (typed < 0) return "VAT can't be negative";
  if (value.priceIncludesVat && price > 0 && typed >= price) {
    return "VAT must be less than the amount, which includes it";
  }
  return undefined;
}

/**
 * The amount to send: what was paid, VAT included. Unchanged unless the
 * price was typed before VAT (or the business isn't registered).
 */
export function paidAmount(
  value: VatValue,
  price: number,
  options: { registered: boolean; taxes: IOrgTax[] },
): number {
  if (!options.registered) return price;
  return vatBreakdown(value, price, options.taxes).paid;
}

/**
 * The VAT fields to send. Nothing unless registered. On edit, a tax left as
 * it was isn't sent (keeps one deleted since), "" removes it. A price before
 * VAT sends the VAT itself, so the receipt's figure is kept to the kobo.
 */
export function vatPayload(
  value: VatValue,
  options: {
    registered: boolean;
    original?: Expense;
    price: number;
    taxes: IOrgTax[];
  },
): ExpenseVatFields {
  if (!options.registered) return {};
  const { original } = options;
  const isEdit = Boolean(original);
  const originalId = original?.tax?.id ?? "";
  if (!value.taxId) {
    return isEdit && original?.tax ? { taxId: null } : {};
  }
  const onTop = !value.priceIncludesVat;
  return {
    ...(isEdit && value.taxId === originalId && original?.tax?.id
      ? {}
      : { taxId: value.taxId }),
    taxAmount:
      value.manual || onTop
        ? vatBreakdown(value, options.price, options.taxes).vat
        : isEdit
          ? null
          : undefined,
    vatClaimable: value.vatClaimable,
  };
}

const PRICE_OPTIONS = [
  { value: "before", label: "Price before VAT" },
  { value: "includes", label: "Price includes VAT" },
];

interface ExpenseVatFieldProps {
  value: VatValue;
  onChange: (next: VatValue) => void;
  /** The price typed (quantity × unit cost, or the amount). */
  amount: number;
  /**
   * Invoice costs and schedules: the VAT is worked out on each amount, so
   * there's no figure to show or type.
   */
  perAmount?: boolean;
  /**
   * Schedules: the amount is what's paid each time, VAT included, since the
   * VAT in it follows the rate on the day.
   */
  includedOnly?: boolean;
  disabled?: boolean;
}

export function ExpenseVatField({
  value,
  onChange,
  amount,
  perAmount = false,
  includedOnly = false,
  disabled,
}: ExpenseVatFieldProps) {
  const { registered, taxes } = useExpenseVat();
  const { formatMoney } = useFormatMoney();
  if (!registered) return null;

  const tax = taxes.find((t) => t.id === value.taxId);
  const rate = Number(tax?.rate ?? 0);
  const breakdown = vatBreakdown(value, amount, taxes);
  const error = vatError(value, amount);
  const set = (changes: Partial<VatValue>) =>
    onChange({ ...value, ...changes });
  const includes = includedOnly || value.priceIncludesVat;

  const perAmountHint = !value.taxId
    ? undefined
    : includes
      ? "Each amount is what was paid, VAT included."
      : `${rate}% VAT is added to each amount.`;

  return (
    <Box gridColumn={{ sm: "1 / -1" }}>
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <CustomSelect
          label="VAT"
          options={[
            { value: NONE, label: "No VAT" },
            ...taxes.map((t) => ({
              value: t.id,
              label: `${t.name} (${Number(t.rate)}%)`,
            })),
          ]}
          value={[value.taxId || NONE]}
          disabled={disabled}
          onChange={(opt: { value: string[] }) => {
            const next = opt?.value?.[0] ?? NONE;
            set({ taxId: next === NONE ? "" : next });
          }}
          helperText={perAmount ? perAmountHint : undefined}
        />

        {value.taxId && !includedOnly && (
          <Box>
            <CustomSelect
              label="The price you entered"
              options={PRICE_OPTIONS}
              value={[value.priceIncludesVat ? "includes" : "before"]}
              disabled={disabled}
              onChange={(opt: { value: string[] }) =>
                // A typed VAT belonged to the other reading of the price.
                set({
                  priceIncludesVat: opt?.value?.[0] === "includes",
                  manual: false,
                  taxAmount: "",
                })
              }
            />
          </Box>
        )}

        {value.taxId && !perAmount && (
          <Box gridColumn={{ sm: "1 / -1" }}>
            {value.manual ? (
              <Box maxW={{ sm: "50%" }} pr={{ sm: "2" }}>
                <CustomNumberInput
                  label="VAT (₦)"
                  precision={2}
                  min={0}
                  allowNegative={false}
                  value={value.taxAmount}
                  onValueChange={(raw: string) => set({ taxAmount: raw })}
                  disabled={disabled}
                  error={error}
                  helperText="As the receipt shows it"
                />
              </Box>
            ) : null}
            <Flex
              mt={value.manual ? "2" : "0"}
              align="center"
              gap="3"
              wrap="wrap"
              bg="gray.50"
              rounded="md"
              px="3"
              py="2"
              fontSize="14px"
              color="black"
              data-testid="vat-breakdown"
            >
              <Text color="black">
                {formatMoney(breakdown.net)} +{" "}
                <Text as="span" fontWeight="600">
                  {formatMoney(breakdown.vat)} VAT
                </Text>
                {!value.manual && rate ? ` (${rate}%)` : ""} ={" "}
                <Text as="span" fontWeight="600">
                  {formatMoney(breakdown.paid)} paid
                </Text>
              </Text>
              <Button
                size="xs"
                variant="outline"
                color="black"
                borderColor="gray.200"
                bg="white"
                disabled={disabled}
                onClick={() =>
                  value.manual
                    ? set({ manual: false, taxAmount: "" })
                    : set({
                        manual: true,
                        taxAmount: breakdown.vat ? String(breakdown.vat) : "",
                      })
                }
              >
                {value.manual ? "Work it out from the rate" : "Edit VAT"}
              </Button>
            </Flex>
          </Box>
        )}

        {value.taxId && (
          <Box gridColumn={{ sm: "1 / -1" }}>
            <CustomCheckbox
              checked={value.vatClaimable}
              disabled={disabled}
              onCheckedChange={(e: { checked: boolean | "indeterminate" }) =>
                set({ vatClaimable: e.checked === true })
              }
              helperText={
                value.vatClaimable
                  ? undefined
                  : "The VAT is recorded but not reclaimed: it stays part of the cost."
              }
            >
              I have the supplier's VAT invoice (VAT can be claimed back)
            </CustomCheckbox>
          </Box>
        )}
      </Grid>
    </Box>
  );
}
