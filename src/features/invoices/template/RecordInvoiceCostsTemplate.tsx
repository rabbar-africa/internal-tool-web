import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  IconButton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { PaymentModeDto } from "@/shared/interface/payment";
import { PAYMENT_MODE_OPTIONS } from "@/shared/interface/expense";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import {
  useGetInvoiceCostsQuery,
  useRecordInvoiceCostsMutation,
} from "@/features/expenses/api/query";
import { useGetInvoiceByIdQuery } from "../api/query";

interface OtherCostRow {
  key: number;
  name: string;
  amount: string;
}

const today = () => new Date().toISOString().split("T")[0];
const toNum = (v: string) => Number(v) || 0;

/** Card wrapper matching the rest of the app's form sections. */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      p={{ base: "4", md: "5" }}
    >
      <Text textStyle="small-semibold" color="gray.500">
        {title}
      </Text>
      {subtitle && (
        <Text textStyle="tiny-regular" color="gray.300" mb="4">
          {subtitle}
        </Text>
      )}
      {!subtitle && <Box mb="4" />}
      {children}
    </Box>
  );
}

/**
 * "Record costs" on an invoice: what was spent to do the job, entered against
 * each item, plus other costs (towing, sublet, fuel…). Saving ADDS expenses —
 * come back as more is spent; earlier costs stay.
 */
export function RecordInvoiceCostsTemplate() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();

  const { data: invoiceData } = useGetInvoiceByIdQuery(id);
  const invoice = invoiceData?.data;
  const { data: costsData, isLoading } = useGetInvoiceCostsQuery(id);
  const costs = costsData?.data;
  const { mutateAsync: recordCosts, isPending } =
    useRecordInvoiceCostsMutation();

  // Shared by every expense this save creates.
  const [date, setDate] = useState(today);
  const [paymentMode, setPaymentMode] = useState<PaymentModeDto | "">("");
  const [accountId, setAccountId] = useState("");
  const accountPickedRef = useRef(false);
  const [vendorName, setVendorName] = useState("");

  const [spentNow, setSpentNow] = useState<Record<string, string>>({});
  const nextKey = useRef(1);
  const [other, setOther] = useState<OtherCostRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const totalNow = useMemo(
    () =>
      Object.values(spentNow).reduce((sum, v) => sum + toNum(v), 0) +
      other.reduce((sum, row) => sum + toNum(row.amount), 0),
    [spentNow, other],
  );

  // Cash and non-cash default to different accounts; follow the mode unless
  // the user picked one by hand.
  const handleModeChange = (mode: PaymentModeDto | "") => {
    const wasCash = paymentMode === PaymentModeDto.CASH;
    setPaymentMode(mode);
    if (
      wasCash !== (mode === PaymentModeDto.CASH) &&
      !accountPickedRef.current
    ) {
      setAccountId("");
    }
  };

  const backToInvoice = () =>
    navigate(RouteConstants.invoices.detail.generate({ id }));

  const save = async () => {
    const lines = (costs?.lines ?? [])
      .map((line) => ({
        invoiceLineItemId: line.invoiceLineItemId,
        amount: toNum(spentNow[line.invoiceLineItemId] ?? ""),
      }))
      .filter((line) => line.amount > 0);
    const others = other
      .map((row) => ({ name: row.name.trim(), amount: toNum(row.amount) }))
      .filter((row) => row.amount > 0);

    if (others.some((row) => !row.name)) {
      setFormError("Give every other cost a name.");
      return;
    }
    if (!lines.length && !others.length) {
      setFormError("Enter an amount for at least one item or other cost.");
      return;
    }
    setFormError(null);

    await recordCosts({
      invoiceId: id,
      payload: {
        date,
        ...(paymentMode ? { paymentMode } : {}),
        ...(accountId ? { paidThroughAccountId: accountId } : {}),
        ...(vendorName.trim() ? { vendorName: vendorName.trim() } : {}),
        ...(lines.length ? { lines } : {}),
        ...(others.length ? { other: others } : {}),
      },
    });
    // The costs query refetches, so "Spent so far" goes up; clear the boxes
    // for the next round of spending.
    setSpentNow({});
    setOther([]);
  };

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.300" />
      </Center>
    );
  }

  if (!costs) {
    return (
      <Center py="20">
        <Text color="red.500">Invoice not found.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="5" pb="6">
      <Box>
        <Button
          variant="ghost"
          size="xs"
          px="1"
          mb="2"
          color="primary.300"
          onClick={backToInvoice}
        >
          ← {costs.invoiceNumber}
        </Button>
        <PageHeader
          title="Record Costs"
          subtitle={`What you spent on ${costs.invoiceNumber}${
            invoice?.customerName ? ` for ${invoice.customerName}` : ""
          }. Each save adds to what's already recorded.`}
        />
      </Box>

      <Section title="Payment" subtitle="Applies to every cost in this save">
        <Grid
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }}
          gap="4"
        >
          <CustomInput
            label="Date"
            type="date"
            required
            value={date}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDate(event.target.value)
            }
          />
          <CustomSelect
            label="How It Was Paid"
            placeholder="Select payment mode..."
            options={PAYMENT_MODE_OPTIONS}
            value={paymentMode ? [paymentMode] : undefined}
            onChange={(opt: { value: string[] }) =>
              handleModeChange((opt?.value?.[0] as PaymentModeDto) ?? "")
            }
          />
          <AccountSelect
            label="Paid From"
            includeCash
            isCash={paymentMode === PaymentModeDto.CASH}
            value={accountId}
            onChange={(next) => {
              accountPickedRef.current = true;
              setAccountId(next);
            }}
          />
          <CustomInput
            label="Supplier (optional)"
            value={vendorName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setVendorName(event.target.value)
            }
            placeholder="e.g. Ladipo Spares"
          />
        </Grid>
      </Section>

      <Section
        title="Invoice items"
        subtitle="Enter what you spent on each item this time. Leave the rest blank."
      >
        <Grid
          templateColumns="1fr 8rem 10rem"
          gap="3"
          pb="2"
          display={{ base: "none", md: "grid" }}
        >
          <Text textStyle="tiny-regular" color="gray.300">
            Item
          </Text>
          <Text textStyle="tiny-regular" color="gray.300" textAlign="right">
            Billed · Spent so far
          </Text>
          <Text textStyle="tiny-regular" color="gray.300">
            Spent now (₦)
          </Text>
        </Grid>
        <Stack gap="3">
          {costs.lines.map((line) => (
            <Grid
              key={line.invoiceLineItemId}
              templateColumns={{ base: "1fr", md: "1fr 8rem 10rem" }}
              gap={{ base: "2", md: "3" }}
              alignItems="center"
              pt="3"
              borderTopWidth="1px"
              borderColor="gray.50"
            >
              <Text textStyle="small-semibold" color="gray.500">
                {line.name}
              </Text>
              <Text
                textStyle="tiny-regular"
                color="gray.400"
                textAlign={{ base: "left", md: "right" }}
              >
                Billed {formatMoney(line.billed)}
                <br />
                Spent so far {formatMoney(line.spent)}
              </Text>
              <CustomNumberInput
                precision={2}
                min={0}
                allowNegative={false}
                placeholder="0.00"
                value={spentNow[line.invoiceLineItemId] ?? ""}
                onValueChange={(raw) =>
                  setSpentNow((prev) => ({
                    ...prev,
                    [line.invoiceLineItemId]: raw,
                  }))
                }
              />
            </Grid>
          ))}
          {costs.lines.length === 0 && (
            <Text textStyle="small-regular" color="gray.300">
              This invoice has no items. Add costs below instead.
            </Text>
          )}
        </Stack>
      </Section>

      <Section
        title="Other costs"
        subtitle="Costs that aren't one of the invoice's items: towing, sublet work, fuel…"
      >
        <Stack gap="3">
          {other.map((row) => (
            <Grid
              key={row.key}
              templateColumns={{ base: "1fr auto", md: "1fr 10rem auto" }}
              gap="3"
              alignItems="end"
            >
              <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
                <CustomInput
                  label="What"
                  value={row.name}
                  placeholder="e.g. Towing"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setOther((prev) =>
                      prev.map((r) =>
                        r.key === row.key
                          ? { ...r, name: event.target.value }
                          : r,
                      ),
                    )
                  }
                />
              </Box>
              <CustomNumberInput
                label="Amount (₦)"
                precision={2}
                min={0}
                allowNegative={false}
                placeholder="0.00"
                value={row.amount}
                onValueChange={(raw) =>
                  setOther((prev) =>
                    prev.map((r) =>
                      r.key === row.key ? { ...r, amount: raw } : r,
                    ),
                  )
                }
              />
              <IconButton
                aria-label="Remove cost"
                variant="ghost"
                size="sm"
                mb="1"
                onClick={() =>
                  setOther((prev) => prev.filter((r) => r.key !== row.key))
                }
              >
                <TrashIcon color="gray.300" />
              </IconButton>
            </Grid>
          ))}
          <Box>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setOther((prev) => [
                  ...prev,
                  { key: nextKey.current++, name: "", amount: "" },
                ])
              }
            >
              + Add other cost
            </Button>
          </Box>
        </Stack>
      </Section>

      <Flex
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="small-semibold" color="gray.500">
            Recording now: {formatMoney(totalNow)}
          </Text>
          {formError && (
            <Text textStyle="tiny-regular" color="error.300">
              {formError}
            </Text>
          )}
        </Box>
        <Flex gap="3" justify="flex-end">
          <Button
            variant="outline"
            onClick={backToInvoice}
            disabled={isPending}
          >
            Done
          </Button>
          <Button loading={isPending} onClick={() => void save()}>
            Save Costs
          </Button>
        </Flex>
      </Flex>
    </Stack>
  );
}
