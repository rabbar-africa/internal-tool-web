import { useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Link,
  Separator,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import moment from "moment";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetOrganizationTemplates } from "@/features/settings/api/query";
import type { ICreditNote } from "@/shared/interface/credit-note";
import { CREDIT_NOTE_REASON_OPTIONS } from "../../utils/credit-note-status";
import { CreditNoteStatusBadge } from "../CreditNoteStatusBadge";
import { useCreditNoteForm } from "./useCreditNoteForm";

const ORG_DEFAULT_TEMPLATE = "organization-default";

/** Editable fields keep a 16px floor on phones, or iOS zooms on focus. */
const fieldFont = { base: "1rem", lg: "13px" };

const card = {
  bg: "white",
  rounded: ".625rem",
  borderWidth: "1px",
  borderColor: "gray.75",
  shadow: "xs",
} as const;

const formatDay = (value?: string | null) =>
  value ? moment(value).format("DD MMM YYYY") : "—";

interface CreditNoteFormProps {
  invoiceId: string;
  /** Editing: the saved note. */
  note?: ICreditNote;
}

/**
 * Credits lines of one invoice. Totals always come from the API's preview,
 * which uses the invoice's own discount and VAT.
 */
export function CreditNoteForm({ invoiceId, note }: CreditNoteFormProps) {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const form = useCreditNoteForm({ invoiceId, note });
  const { draft, lines, rows, setRow, lineErrors, fields, setField, preview } =
    form;

  const { data: templatesData } = useGetOrganizationTemplates();
  const templateOptions = useMemo(() => {
    const templates = (templatesData?.data ?? []).filter(
      (template) => template.module === "CREDIT_NOTE",
    );
    return templates.length === 0
      ? []
      : [
          { label: "Organization default", value: ORG_DEFAULT_TEMPLATE },
          ...templates.map((template) => ({
            label: template.name,
            value: template.id,
          })),
        ];
  }, [templatesData]);

  const previewLine = useMemo(
    () =>
      new Map(
        (preview?.lines ?? []).map((line) => [line.invoiceLineItemId, line]),
      ),
    [preview],
  );

  if (form.isDraftLoading) {
    return (
      <Stack gap="4">
        <Skeleton h="6rem" rounded="lg" />
        <Skeleton h="16rem" rounded="lg" />
      </Stack>
    );
  }
  if (!draft) {
    return (
      <Box {...card} p="6">
        <Text fontSize="14px" color="error.300">
          {form.draftError ?? "We couldn't load this invoice."}
        </Text>
      </Box>
    );
  }

  const { invoice } = draft;
  const showBlocker = form.submitted || Boolean(draft.refusal);

  return (
    <Stack gap="5">
      {/* The invoice being credited */}
      <Box {...card} p={{ base: "4", md: "5" }}>
        <Flex justify="space-between" gap="4" wrap="wrap">
          <Box>
            <Text fontSize="12px" color="gray.300">
              Crediting
            </Text>
            <Link asChild fontSize="16px" fontWeight="700" color="primary.300">
              <RouterLink
                to={RouteConstants.invoices.detail.generate({ id: invoice.id })}
              >
                {invoice.invoiceNumber}
              </RouterLink>
            </Link>
            <Text fontSize="13px" color="gray.500">
              {invoice.customerName ?? "—"} · {formatDay(invoice.date)}
            </Text>
          </Box>
          <Flex gap={{ base: "4", md: "8" }} wrap="wrap">
            {[
              ["Invoice total", invoice.total],
              ["Still owed", invoice.balance],
              ["Already credited", draft.credited],
              ["Left to credit", draft.total],
            ].map(([label, value]) => (
              <Box key={label as string}>
                <Text fontSize="11px" color="gray.300">
                  {label}
                </Text>
                <Text fontSize="14px" fontWeight="600" color="gray.500">
                  {formatMoney(value as number)}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>

        {draft.creditNotes.length > 0 && (
          <Flex gap="2" mt="3" wrap="wrap" align="center">
            <Text fontSize="12px" color="gray.300">
              {note ? "Other credit notes:" : "Earlier credit notes:"}
            </Text>
            {draft.creditNotes.map((other) => (
              <Flex key={other.id} gap="1.5" align="center">
                <Link asChild fontSize="12px" color="primary.300">
                  <RouterLink
                    to={RouteConstants.creditNotes.detail.generate({
                      id: other.id,
                    })}
                  >
                    {other.creditNoteNumber}
                  </RouterLink>
                </Link>
                <CreditNoteStatusBadge
                  status={other.status}
                  h="1.25rem"
                  minW="auto"
                  px="2"
                  fontSize="10px"
                />
              </Flex>
            ))}
          </Flex>
        )}

        {draft.refusal && (
          <Text mt="3" fontSize="13px" color="error.300" fontWeight="500">
            {draft.refusal}
          </Text>
        )}
      </Box>

      {/* The lines */}
      <Box {...card} overflow="hidden">
        <Box px={{ base: "4", md: "5" }} pt="4" pb="2">
          <Text fontSize="15px" fontWeight="700" color="gray.500">
            What are you crediting?
          </Text>
          <Text fontSize="12px" color="gray.300">
            Tick each line and set how much of it. Lower the rate to credit part
            of a price, like ₦5,000 off the labour.
          </Text>
        </Box>

        <Grid
          display={{ base: "none", md: "grid" }}
          templateColumns="2rem 1fr 7rem 8rem 8rem"
          gap="3"
          px="5"
          py="2"
          bg="gray.50"
          fontSize="11px"
          fontWeight="600"
          color="gray.300"
          textTransform="uppercase"
        >
          <span />
          <span>Item</span>
          <span>Qty</span>
          <span>Rate</span>
          <Text textAlign="right">Credit</Text>
        </Grid>

        <Stack gap="0" separator={<Separator borderColor="gray.75" />}>
          {lines.map((line) => {
            const id = line.invoiceLineItemId;
            const row = rows[id];
            const done = line.creditableQuantity <= 0;
            const error = row?.ticked ? lineErrors[id] : null;
            const credited = previewLine.get(id);
            return (
              <Grid
                key={id}
                templateColumns={{
                  base: "2rem 1fr",
                  md: "2rem 1fr 7rem 8rem 8rem",
                }}
                gap="3"
                px={{ base: "4", md: "5" }}
                py="3"
                alignItems="start"
                opacity={done && !row?.ticked ? 0.5 : 1}
              >
                <Box pt="1">
                  <CustomCheckbox
                    aria-label={`Credit ${line.name}`}
                    checked={Boolean(row?.ticked)}
                    disabled={done && !row?.ticked}
                    onCheckedChange={({ checked }) =>
                      setRow(id, { ticked: Boolean(checked) })
                    }
                  />
                </Box>
                <Box minW={0}>
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    {line.name}
                  </Text>
                  {line.description && (
                    <Text fontSize="12px" color="gray.300">
                      {line.description}
                    </Text>
                  )}
                  <Text fontSize="11px" color="gray.300" mt="0.5">
                    Invoiced {line.quantity} × {formatMoney(line.rate)}
                    {line.creditedQuantity > 0 &&
                      ` · ${line.creditedQuantity} already credited`}
                    {done && " · credited in full"}
                  </Text>
                  {error && (
                    <Text fontSize="12px" color="error.300" mt="1">
                      {error}
                    </Text>
                  )}
                </Box>
                <Box gridColumn={{ base: "2", md: "auto" }}>
                  <CustomInput
                    label="Qty"
                    labelProps={{ display: { md: "none" }, mb: "1" }}
                    value={row?.quantity ?? ""}
                    disabled={!row?.ticked}
                    onChange={(e) => setRow(id, { quantity: e.target.value })}
                    inputProps={{
                      inputMode: "decimal",
                      fontSize: fieldFont,
                      h: "2.25rem",
                    }}
                  />
                </Box>
                <Box gridColumn={{ base: "2", md: "auto" }}>
                  <CustomInput
                    label="Rate"
                    labelProps={{ display: { md: "none" }, mb: "1" }}
                    value={row?.rate ?? ""}
                    disabled={!row?.ticked}
                    onChange={(e) => setRow(id, { rate: e.target.value })}
                    inputProps={{
                      inputMode: "decimal",
                      fontSize: fieldFont,
                      h: "2.25rem",
                    }}
                  />
                </Box>
                <Text
                  gridColumn={{ base: "2", md: "auto" }}
                  textAlign={{ base: "left", md: "right" }}
                  fontSize="13px"
                  fontWeight="600"
                  color={row?.ticked ? "gray.500" : "gray.200"}
                  pt={{ md: "2" }}
                >
                  {row?.ticked && credited ? formatMoney(credited.total) : "—"}
                </Text>
              </Grid>
            );
          })}
        </Stack>

        {(form.showShipping || form.showAdjustment) && (
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap="4"
            px={{ base: "4", md: "5" }}
            py="4"
            borderTopWidth="1px"
            borderColor="gray.75"
          >
            {form.showShipping && (
              <CustomInput
                label={`Shipping to credit (up to ${formatMoney(draft.shippingCharge)})`}
                value={fields.shippingCharge}
                onChange={(e) => setField("shippingCharge", e.target.value)}
                inputProps={{ inputMode: "decimal", fontSize: fieldFont }}
              />
            )}
            {form.showAdjustment && (
              <CustomInput
                label={`Adjustment to credit (up to ${formatMoney(draft.adjustment)})`}
                helperText={invoice.adjustmentDescription ?? undefined}
                value={fields.adjustment}
                onChange={(e) => setField("adjustment", e.target.value)}
                inputProps={{ inputMode: "decimal", fontSize: fieldFont }}
              />
            )}
          </Grid>
        )}
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap="5">
        {/* Details */}
        <Box {...card} p={{ base: "4", md: "5" }}>
          <Stack gap="4">
            {!form.isEdit && (
              <CustomInput
                label="Credit Note #"
                required={!form.isAutoNumber}
                placeholder="e.g. CN-000001"
                value={fields.creditNoteNumber}
                onChange={(e) => setField("creditNoteNumber", e.target.value)}
                disabled={form.isAutoNumber}
                helperText={
                  form.isAutoNumber
                    ? "Numbered automatically (Settings → Auto Numbering)"
                    : undefined
                }
                error={
                  form.submitted ? (form.numberError ?? undefined) : undefined
                }
              />
            )}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
              <CustomInput
                label="Date"
                type="date"
                required
                value={fields.date}
                onChange={(e) => setField("date", e.target.value)}
                inputProps={{ min: invoice.date?.slice(0, 10) }}
                error={form.dateError ?? undefined}
              />
              <CustomSelect
                label="Reason"
                placeholder="Choose a reason"
                options={CREDIT_NOTE_REASON_OPTIONS}
                value={fields.reason ? [fields.reason] : undefined}
                onChange={(opt: { value: string[] }) =>
                  setField(
                    "reason",
                    (opt?.value?.[0] ?? "") as typeof fields.reason,
                  )
                }
              />
            </Grid>
            <CustomInput
              label="Reason details"
              placeholder="e.g. two brake pads not fitted"
              value={fields.reasonNote}
              onChange={(e) => setField("reasonNote", e.target.value)}
            />
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
              <CustomInput
                label="Reference"
                placeholder="Optional"
                value={fields.referenceNumber}
                onChange={(e) => setField("referenceNumber", e.target.value)}
              />
              {templateOptions.length > 0 && (
                <CustomSelect
                  label="Template"
                  options={templateOptions}
                  value={[fields.templateId || ORG_DEFAULT_TEMPLATE]}
                  onChange={(opt: { value: string[] }) => {
                    const value = opt?.value?.[0] ?? "";
                    setField(
                      "templateId",
                      value === ORG_DEFAULT_TEMPLATE ? "" : value,
                    );
                  }}
                />
              )}
            </Grid>
            <CustomTextArea
              label="Notes"
              placeholder="Shown on the credit note"
              rows={3}
              value={fields.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </Stack>
        </Box>

        {/* Totals, from the API */}
        <Box {...card} p={{ base: "4", md: "5" }} alignSelf="start">
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="15px" fontWeight="700" color="gray.500">
              Credit
            </Text>
            {form.isPreviewing && <Spinner size="xs" color="gray.300" />}
          </Flex>
          {preview ? (
            <Stack gap="2" fontSize="13px">
              {(
                [
                  ["Sub total", preview.subTotal],
                  ["Discount", -preview.discount],
                  [`Tax`, preview.taxAmount],
                  ["Shipping", preview.shippingCharge],
                  ["Adjustment", preview.adjustment],
                  ["Round off", preview.roundOff],
                ] as [string, number][]
              )
                .filter(
                  ([label, value]) => label === "Sub total" || value !== 0,
                )
                .map(([label, value]) => (
                  <Flex key={label} justify="space-between" color="gray.400">
                    <Text>{label}</Text>
                    <Text>{formatMoney(value)}</Text>
                  </Flex>
                ))}
              <Separator borderColor="gray.75" />
              <Flex
                justify="space-between"
                fontSize="15px"
                fontWeight="700"
                color="gray.500"
              >
                <Text>Total credit</Text>
                <Text>{formatMoney(preview.total)}</Text>
              </Flex>
              {preview.completesInvoice && (
                <Text fontSize="12px" color="gray.300">
                  This credits everything left on {invoice.invoiceNumber}.
                </Text>
              )}
            </Stack>
          ) : (
            <Text fontSize="13px" color="gray.300">
              {form.previewError ?? "Tick a line to see the credit."}
            </Text>
          )}

          {form.previewError && preview && (
            <Text mt="2" fontSize="12px" color="error.300">
              {form.previewError}
            </Text>
          )}

          {!form.isEdit && (
            <Box mt="4" pt="4" borderTopWidth="1px" borderColor="gray.75">
              <CustomCheckbox
                checked={fields.applyToInvoice}
                onCheckedChange={({ checked }) =>
                  setField("applyToInvoice", Boolean(checked))
                }
                label={`Apply to ${invoice.invoiceNumber} now`}
              />
              <Text fontSize="11px" color="gray.300" mt="1" pl="6">
                {invoice.balance > 0
                  ? `Up to ${formatMoney(invoice.balance)}, what it still owes. Any more stays as open credit.`
                  : `${invoice.invoiceNumber} is paid, so the credit stays open to refund or use on another invoice.`}
              </Text>
            </Box>
          )}
        </Box>
      </Grid>

      {showBlocker && form.blocker && (
        <Text fontSize="13px" color="error.300" textAlign="right">
          {form.blocker}
        </Text>
      )}

      <Flex
        justify="flex-end"
        gap="3"
        direction={{ base: "column-reverse", sm: "row" }}
      >
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        {!form.isEdit && (
          <Button
            variant="outline"
            loading={form.isSaving}
            disabled={Boolean(draft.refusal)}
            onClick={() => form.submit("DRAFT")}
          >
            Save as draft
          </Button>
        )}
        <Button
          loading={form.isSaving}
          disabled={
            Boolean(draft.refusal) || (form.submitted && Boolean(form.blocker))
          }
          onClick={() => form.submit("OPEN")}
        >
          {form.isEdit ? "Save changes" : "Save and issue"}
        </Button>
      </Flex>
    </Stack>
  );
}
