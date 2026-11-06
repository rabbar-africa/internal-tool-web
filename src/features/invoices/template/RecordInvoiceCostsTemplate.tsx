import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  IconButton,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
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
import { usePermissions } from "@/hooks/usePermissions";
import {
  EditCostGroupDialog,
  type GroupableLine,
} from "../components/record-costs/EditCostGroupDialog";

interface OtherCostRow {
  key: number;
  name: string;
  amount: string;
}

/**
 * One amount box: a single item, or items bought together for one price. A
 * group already saved stays a group, and its box adds to it.
 */
interface CostRow {
  key: string;
  kind: "single" | "saved-group" | "new-group";
  lineIds: string[];
  name: string;
  billed: number;
  spent: number;
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
  const [searchParams] = useSearchParams();
  const jobCardId = searchParams.get("jobCardId") ?? "";
  const { formatMoney } = useFormatMoney();
  const { canUpdate } = usePermissions();

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

  // By row key, so a group has one box however many items it covers.
  const [spentNow, setSpentNow] = useState<Record<string, string>>({});
  const nextKey = useRef(1);
  const [other, setOther] = useState<OtherCostRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Items ticked, and the groups made from them on this screen.
  const [ticked, setTicked] = useState<string[]>([]);
  const [newGroups, setNewGroups] = useState<
    { key: string; lineIds: string[] }[]
  >([]);
  // The saved group whose items are being changed.
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const costRows = useMemo<CostRow[]>(() => {
    if (!costs) return [];
    const inNewGroup = new Set(newGroups.flatMap((group) => group.lineIds));
    const singles = costs.lines.filter(
      (line) => !inNewGroup.has(line.invoiceLineItemId),
    );
    return [
      ...(costs.shared ?? []).map((group): CostRow => {
        const lineIds = group.lines.map((line) => line.invoiceLineItemId);
        return {
          // By its first purchase, which survives a change to its items, so
          // an amount typed in its box stays put.
          key: `saved-${group.expenses[0]?.id ?? lineIds.join()}`,
          kind: "saved-group",
          lineIds,
          name: group.lines.map((line) => line.name).join(", "),
          billed: group.billed,
          spent: group.spent,
        };
      }),
      ...newGroups.map((group): CostRow => {
        const lines = costs.lines.filter((line) =>
          group.lineIds.includes(line.invoiceLineItemId),
        );
        return {
          key: group.key,
          kind: "new-group",
          lineIds: group.lineIds,
          name: lines.map((line) => line.name).join(", "),
          billed: lines.reduce((sum, line) => sum + line.billed, 0),
          spent: lines.reduce((sum, line) => sum + line.spent, 0),
        };
      }),
      ...singles.map(
        (line): CostRow => ({
          key: line.invoiceLineItemId,
          kind: "single",
          lineIds: [line.invoiceLineItemId],
          name: line.name,
          billed: line.billed,
          spent: line.spent,
        }),
      ),
    ];
  }, [costs, newGroups]);

  const singleRowCount = costRows.filter((r) => r.kind === "single").length;

  const editingRow = costRows.find((row) => row.key === editingKey);
  // Every item on the invoice, in its order, for picking a group's items.
  const groupableLines = useMemo<GroupableLine[]>(() => {
    if (!costs || !editingRow) return [];
    const byId = new Map(
      [
        ...costs.lines.map((l) => ({ ...l, id: l.invoiceLineItemId })),
        ...(costs.shared ?? []).flatMap((g) =>
          g.lines.map((l) => ({ ...l, id: l.invoiceLineItemId })),
        ),
      ].map((l) => [l.id, l]),
    );
    const inOtherGroup = new Set(
      costRows
        .filter((row) => row.kind === "saved-group" && row !== editingRow)
        .flatMap((row) => row.lineIds),
    );
    const inNewGroup = new Set(newGroups.flatMap((group) => group.lineIds));
    const order = invoice?.lineItems?.map((line) => line.id) ?? [];
    return [...byId.values()]
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
      .map((line) => ({
        id: line.id,
        name: line.name,
        billed: line.billed,
        lockedReason: inOtherGroup.has(line.id)
          ? "Bought together with other items"
          : inNewGroup.has(line.id)
            ? "In a group you're making on this page"
            : undefined,
      }));
  }, [costs, costRows, editingRow, newGroups, invoice?.lineItems]);

  // Cut down to one item, the group's box is that item's box now.
  const handleGroupSaved = (key: string, lineIds: string[]) => {
    if (lineIds.length !== 1) return;
    setSpentNow((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev, [lineIds[0]]: prev[key] };
      delete next[key];
      return next;
    });
  };

  const groupTicked = () => {
    const key = `new-${nextKey.current++}`;
    setNewGroups((prev) => [...prev, { key, lineIds: ticked }]);
    // An amount typed for one item isn't the price of the group.
    setSpentNow((prev) => {
      const next = { ...prev };
      ticked.forEach((lineId) => delete next[lineId]);
      return next;
    });
    setTicked([]);
    setFormError(null);
  };

  const ungroup = (key: string) => {
    setNewGroups((prev) => prev.filter((group) => group.key !== key));
    setSpentNow((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const totalNow = useMemo(
    () =>
      costRows.reduce((sum, row) => sum + toNum(spentNow[row.key] ?? ""), 0) +
      other.reduce((sum, row) => sum + toNum(row.amount), 0),
    [costRows, spentNow, other],
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

  // Back where they came from: the job card's expenses, or the invoice.
  const goBack = () =>
    navigate(
      jobCardId
        ? RouteConstants.jobCards.detail.generate(
            { id: jobCardId },
            { tab: "expenses" },
          )
        : RouteConstants.invoices.detail.generate({ id }),
    );

  const save = async () => {
    const filled = costRows
      .map((row) => ({ row, amount: toNum(spentNow[row.key] ?? "") }))
      .filter(({ amount }) => amount > 0);
    // The API takes a group of 2 or more; one left after an invoice edit is
    // just an item.
    const lines = filled
      .filter(({ row }) => row.lineIds.length === 1)
      .map(({ row, amount }) => ({
        invoiceLineItemId: row.lineIds[0],
        amount,
      }));
    const shared = filled
      .filter(({ row }) => row.lineIds.length > 1)
      .map(({ row, amount }) => ({
        invoiceLineItemIds: row.lineIds,
        amount,
      }));
    const others = other
      .map((row) => ({ name: row.name.trim(), amount: toNum(row.amount) }))
      .filter((row) => row.amount > 0);

    if (others.some((row) => !row.name)) {
      setFormError("Give every other cost a name.");
      return;
    }
    if (!lines.length && !shared.length && !others.length) {
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
        ...(shared.length ? { shared } : {}),
        ...(others.length ? { other: others } : {}),
      },
    });
    // A failed save throws before this, so what they typed stays on screen.
    goBack();
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
    // Room under the page, so the bar never sits over the Save button.
    <Stack gap="5" pb={ticked.length >= 2 ? "24" : "6"}>
      <Box>
        <Button
          variant="ghost"
          size="xs"
          px="1"
          mb="2"
          color="primary.300"
          onClick={goBack}
        >
          ← {jobCardId ? "Job card" : costs.invoiceNumber}
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
        subtitle="Enter what you spent on each item this time. Leave the rest blank. Paid one price for several items? Tick them and choose Bought together."
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
          {costRows.map((row) => {
            const isGroup = row.kind !== "single";
            return (
              <Grid
                key={row.key}
                templateColumns={{ base: "1fr", md: "1fr 8rem 10rem" }}
                gap={{ base: "2", md: "3" }}
                alignItems="center"
                pt="3"
                borderTopWidth="1px"
                borderColor="gray.50"
              >
                {isGroup ? (
                  <Box minW={0}>
                    <Flex align="center" gap="2" flexWrap="wrap">
                      <Badge size="sm" bg="primary.50" color="primary.500">
                        Bought together
                      </Badge>
                      {row.kind === "new-group" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          px="1"
                          color="primary.300"
                          onClick={() => ungroup(row.key)}
                        >
                          Ungroup
                        </Button>
                      )}
                      {row.kind === "saved-group" && canUpdate("expenses") && (
                        <Button
                          variant="ghost"
                          size="xs"
                          px="1"
                          color="primary.300"
                          onClick={() => setEditingKey(row.key)}
                        >
                          Edit items
                        </Button>
                      )}
                    </Flex>
                    <Text textStyle="small-semibold" color="gray.500" mt="1">
                      {row.name}
                    </Text>
                  </Box>
                ) : singleRowCount > 1 ? (
                  <CustomCheckbox
                    checked={ticked.includes(row.key)}
                    onCheckedChange={({ checked }: { checked: boolean }) =>
                      setTicked((prev) =>
                        checked
                          ? [...prev, row.key]
                          : prev.filter((lineId) => lineId !== row.key),
                      )
                    }
                    labelProps={{
                      textStyle: "small-semibold",
                      color: "gray.500",
                    }}
                  >
                    {row.name}
                  </CustomCheckbox>
                ) : (
                  <Text textStyle="small-semibold" color="gray.500">
                    {row.name}
                  </Text>
                )}
                <Text
                  textStyle="tiny-regular"
                  color="gray.400"
                  textAlign={{ base: "left", md: "right" }}
                >
                  Billed {formatMoney(row.billed)}
                  <br />
                  Spent so far <b>{formatMoney(row.spent)}</b>
                </Text>
                <CustomNumberInput
                  precision={2}
                  min={0}
                  allowNegative={false}
                  placeholder="0.00"
                  value={spentNow[row.key] ?? ""}
                  onValueChange={(raw) =>
                    setSpentNow((prev) => ({ ...prev, [row.key]: raw }))
                  }
                />
              </Grid>
            );
          })}
          {costRows.length === 0 && (
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
          <Button variant="outline" onClick={goBack} disabled={isPending}>
            Cancel
          </Button>
          <Button loading={isPending} onClick={() => void save()}>
            Save Costs
          </Button>
        </Flex>
      </Flex>

      {editingRow && (
        <EditCostGroupDialog
          invoiceId={id}
          groupLineIds={editingRow.lineIds}
          spent={editingRow.spent}
          lines={groupableLines}
          onClose={() => setEditingKey(null)}
          onSaved={(lineIds) => handleGroupSaved(editingRow.key, lineIds)}
        />
      )}

      {/* Floats over the page, so it's in reach wherever the ticking stopped. */}
      {ticked.length >= 2 && (
        <Portal>
          <Flex
            role="region"
            aria-label="Ticked items"
            position="fixed"
            zIndex="sticky"
            bottom={{ base: "3", md: "6" }}
            left={{ base: "3", md: "50%" }}
            right={{ base: "3", md: "auto" }}
            transform={{ md: "translateX(-50%)" }}
            align="center"
            justify="space-between"
            gap={{ base: "2", md: "6" }}
            px="4"
            py="3"
            bg="white"
            rounded="xl"
            borderWidth="1px"
            borderColor="gray.75"
            shadow="lg"
            animationName="fade-in, slide-from-bottom"
            animationDuration="fast"
          >
            <Text
              textStyle="small-semibold"
              color="gray.500"
              whiteSpace="nowrap"
            >
              {ticked.length} items ticked
            </Text>
            <Flex gap="2" flexShrink={0}>
              <Button variant="ghost" size="sm" onClick={() => setTicked([])}>
                Clear
              </Button>
              <Button size="sm" onClick={groupTicked}>
                Bought together
              </Button>
            </Flex>
          </Flex>
        </Portal>
      )}
    </Stack>
  );
}
