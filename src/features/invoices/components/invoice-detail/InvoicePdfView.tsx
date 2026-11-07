import { Box, Flex, Grid, Image, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { formatAddress } from "@/utils/string-formatter";
import { Link } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import {
  DEFAULT_INVOICE_DESIGN,
  normalizeInvoiceDesign,
  tint,
  type InvoiceFont,
} from "@/features/invoices/utils/invoice-design";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import rabbarLogo from "@/assets/logo.png";
import { RABBAR_SITE_DISPLAY, RABBAR_SITE_URL } from "@/shared/constants/brand";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v: string) => moment(v).format("DD MMM YYYY");

/** PDF fonts as the browser knows them. Poppins is already the app's font. */
const CSS_FONTS: Record<InvoiceFont, string | undefined> = {
  Poppins: undefined,
  Helvetica: "Helvetica, Arial, sans-serif",
  "Times-Roman": '"Times New Roman", Times, serif',
};

interface InvoicePdfViewProps {
  invoice: IInvoiceResponse;
  /** In the template editor: the customer isn't real, so no link to them. */
  isPreview?: boolean;
}

export function InvoicePdfView({
  invoice,
  isPreview = false,
}: InvoicePdfViewProps) {
  const design = normalizeInvoiceDesign(invoice.design);
  const { show, labels } = design;
  const { primaryColor, headerColor, font } = design.style;
  const isModern = design.layout === "modern";
  const isMinimal = design.layout === "minimal";
  // Text on the modern layout's coloured band.
  const bandText = isModern ? "white" : undefined;
  const { formatMoney } = useFormatMoney();
  const { userOrganization } = useCurrentUser();
  const { hasFeature } = usePlanAccess();
  const showRabbarBranding = !hasFeature("noRabbarBranding");

  const client = invoice.client;
  const subtotal = toNum(invoice.subTotal);
  const discountAmount = toNum(invoice.discount);
  const taxAmount = toNum(invoice.taxAmount);
  // The invoice carries the tax it was issued with; older ones have neither.
  const taxPercent = Number(invoice.taxPercent ?? 0);
  const taxLabel = invoice.taxName
    ? `${invoice.taxName}${taxPercent ? ` (${taxPercent}%)` : ""}`
    : "VAT";
  const adjustment = toNum(invoice.adjustment);
  const total = toNum(invoice.total);
  const balance = toNum(invoice.balance);

  // Balances carried from earlier unpaid invoices. These are NOT part of this
  // invoice's total — they stay receivables on their own documents — but the
  // customer settles them first, so the document must show what's due overall.
  const broughtForward = invoice.broughtForward ?? [];
  const hasCarry = broughtForward.length > 0;
  const broughtForwardTotal =
    invoice.broughtForwardTotal != null
      ? Number(invoice.broughtForwardTotal) || 0
      : broughtForward.reduce((sum, c) => sum + toNum(c.balance), 0);
  const totalDueNow =
    invoice.totalDueNow != null
      ? Number(invoice.totalDueNow) || 0
      : balance + broughtForwardTotal;

  const orgLocation = [userOrganization?.city, userOrganization?.country]
    .filter(Boolean)
    .join(" , ");

  const orgConfig = userOrganization?.config;
  // The account this invoice asks to be paid into; older ones fall back to
  // the primary, as the backend PDF does.
  const bankAccount =
    invoice.bankAccount ?? userOrganization?.primaryBankAccount;
  const orgAddress = formatAddress(userOrganization?.primaryAddress);

  const notes = invoice.notes || orgConfig?.invoiceNotesDefault;

  // Vehicle details shown beside the totals. Unrecorded fields are left out.
  const vehicleRows = invoice.vehicle
    ? [
        { label: "Make", value: invoice.vehicle.make },
        { label: "Model", value: invoice.vehicle.model },
        {
          label: "Year",
          value: invoice.vehicle.year ? String(invoice.vehicle.year) : "",
        },
        { label: "Plate No.", value: invoice.vehicle.registrationNumber },
      ].filter((row) => row.value)
    : [];
  // Left off, not deleted: they come back the day the org upgrades.
  const terms = hasFeature("invoiceTerms")
    ? invoice.terms || orgConfig?.invoiceTermsDefault
    : null;

  const shownVehicleRows = show.vehicle ? vehicleRows : [];
  const shownNotes = show.notes ? notes : null;
  const shownBank = show.bankDetails && Boolean(bankAccount?.accountNumber);
  const billingAddress =
    typeof invoice.billingAddress === "string"
      ? invoice.billingAddress.trim()
      : "";
  const balanceBoxProps = isMinimal
    ? ({
        px: "3",
        py: "3",
        mt: "1",
        borderTopWidth: "2px",
        borderColor: headerColor,
      } as const)
    : ({
        bg: isModern ? tint(primaryColor, 0.1) : "gray.50",
        px: "3",
        py: "3",
        rounded: "sm",
        mt: "1",
      } as const);

  const formatPlain = (n: number) => formatMoney(n, { showSymbol: false });
  const formatWithCode = (n: number) =>
    formatMoney(n, { showCurrencyCode: true, showSymbol: false });

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="md"
      shadow="sm"
      px={{ base: "6", md: "12" }}
      py={{ base: "6", md: "12" }}
      maxW="900px"
      mx="auto"
      w="100%"
      fontFamily={CSS_FONTS[font]}
    >
      {/* Top: brand (left) + Invoice + Balance Due (right) */}
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap="6"
        mb="10"
        {...(isModern
          ? {
              bg: headerColor,
              // A band across the full card: cancels the card's own padding.
              mx: { base: "-6", md: "-12" },
              mt: { base: "-6", md: "-12" },
              px: { base: "6", md: "12" },
              py: "8",
              roundedTop: "md",
            }
          : {})}
      >
        <Stack gap="3">
          {!show.logo ? null : userOrganization?.logoUrl ? (
            <Image
              src={userOrganization.logoUrl}
              alt={userOrganization.name}
              maxH="80px"
              maxW="120px"
              objectFit="contain"
              alignSelf="flex-start"
              {...(isModern ? { bg: "white", p: "1", rounded: "sm" } : {})}
            />
          ) : (
            <Box
              w="80px"
              h="80px"
              bg={
                isModern
                  ? "white"
                  : primaryColor === DEFAULT_INVOICE_DESIGN.style.primaryColor
                    ? "primary.500"
                    : primaryColor
              }
              rounded="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize="13px"
                color={isModern ? headerColor : "white"}
                fontWeight="600"
              >
                {userOrganization?.name?.[0] ?? "R"}
              </Text>
            </Box>
          )}
          <Stack gap="0.5">
            <Text
              fontSize="14px"
              fontWeight="700"
              color={bandText ?? "gray.500"}
            >
              {userOrganization?.name ?? "—"}
            </Text>
            {show.rcNumber && userOrganization?.rcNumber && (
              <Text fontSize="12px" color={bandText ?? "gray.400"}>
                RC: {userOrganization.rcNumber}
              </Text>
            )}

            {!show.orgAddress ? null : orgAddress ? (
              <Text fontSize="12px" color={bandText ?? "gray.400"}>
                {orgAddress}
              </Text>
            ) : (
              orgLocation && (
                <Text fontSize="12px" color={bandText ?? "gray.400"}>
                  {orgLocation}
                </Text>
              )
            )}
            {show.orgContact &&
            (userOrganization?.companyEmail || userOrganization?.email) ? (
              <Text fontSize="12px" color={bandText ?? "gray.400"}>
                {userOrganization?.companyEmail || userOrganization?.email}
              </Text>
            ) : null}
            {show.orgContact && userOrganization?.phone && (
              <Text fontSize="12px" color={bandText ?? "gray.400"}>
                {userOrganization.phone}
              </Text>
            )}
            {show.orgContact && userOrganization?.website && (
              <Text fontSize="12px" color={bandText ?? "gray.400"}>
                {userOrganization.website}
              </Text>
            )}
          </Stack>
        </Stack>

        <Stack gap="2" align="flex-end" textAlign="right">
          <Text
            fontSize={
              isMinimal
                ? { base: "24px", md: "28px" }
                : { base: "32px", md: "40px" }
            }
            fontWeight={isMinimal ? "500" : "600"}
            color={bandText ?? (isMinimal ? headerColor : "gray.500")}
            lineHeight="1"
          >
            {labels.title}
          </Text>
          <Text fontSize="13px" color={bandText ?? "gray.500"} fontWeight="600">
            # {invoice.invoiceNumber}
          </Text>
          <Box mt="4">
            <Text
              fontSize="12px"
              color={bandText ?? "gray.300"}
              fontWeight="500"
            >
              {hasCarry ? "Total Due Now" : labels.balanceDue}
            </Text>
            <Text
              fontSize="20px"
              fontWeight="700"
              color={bandText ?? "gray.500"}
              mt="0.5"
            >
              {formatWithCode(hasCarry ? totalDueNow : balance)}
            </Text>
          </Box>
        </Stack>
      </Grid>

      {/* Bill To (left) + Invoice meta (right) */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="6">
        <Stack gap="1" justify="flex-end">
          <Text fontSize="12px" color="gray.400">
            {labels.billTo}
          </Text>
          {!isPreview && client?.id ? (
            <Link
              to={RouteConstants.customers.detail.generate({ id: client.id })}
            >
              <Text fontSize="14px" fontWeight="700" color="gray.500">
                {client?.displayName ?? invoice.customerName ?? "—"}
              </Text>
            </Link>
          ) : (
            <Text fontSize="14px" fontWeight="700" color="gray.500">
              {client?.displayName ?? invoice.customerName ?? "—"}
            </Text>
          )}
          {/* The invoice page leaves this out; the preview shows what prints. */}
          {isPreview && show.billingAddress && billingAddress ? (
            <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
              {billingAddress}
            </Text>
          ) : null}
          {/* {invoice.billingAddress && (
            <Text fontSize="12px" color="gray.400" whiteSpace="pre-line">
              {invoice.billingAddress}
            </Text>
          )} */}
        </Stack>

        <Stack gap="2" justify="flex-end">
          <MetaRow
            label={labels.invoiceDate}
            value={formatDate(invoice.date)}
            color={primaryColor}
          />
          {show.paymentTerms ? (
            <MetaRow
              label={labels.paymentTerms}
              value={invoice.paymentTermsLabel || `Net ${invoice.paymentTerms}`}
              color={primaryColor}
            />
          ) : null}
          {show.dueDate ? (
            <MetaRow
              label={labels.dueDate}
              value={formatDate(invoice.dueDate)}
              color={primaryColor}
            />
          ) : null}
        </Stack>
      </Grid>

      {/* Line items: too wide for a phone, so they scroll inside the card */}
      <Box mb="6" overflowX="auto">
        <Box minW={{ base: "560px", md: "0" }}>
          <Grid
            templateColumns="50px 1fr 90px 130px 130px"
            gap="3"
            px={isMinimal ? "0" : "4"}
            py="3"
            bg={isMinimal ? "white" : isModern ? primaryColor : headerColor}
            {...(isMinimal
              ? { borderBottomWidth: "2px", borderColor: headerColor }
              : {})}
          >
            {[
              "#",
              labels.items,
              labels.quantity,
              labels.rate,
              labels.amount,
            ].map((h, i) => (
              <Text
                key={h}
                fontSize="12px"
                fontWeight={isMinimal ? "600" : "500"}
                color={isMinimal ? headerColor : "white"}
                textAlign={i >= 2 ? "right" : "left"}
              >
                {h}
              </Text>
            ))}
          </Grid>

          {invoice.lineItems?.map((li, idx) => (
            <Grid
              key={li.id}
              templateColumns="50px 1fr 90px 130px 130px"
              gap="3"
              px={isMinimal ? "0" : "4"}
              py="4"
              borderBottomWidth="1px"
              borderColor="gray.75"
              alignItems="start"
            >
              <Text fontSize="13px" color={primaryColor} fontWeight="500">
                {idx + 1}
              </Text>
              <Stack gap="0.5">
                <Text fontSize="13px" fontWeight="600" color="gray.500">
                  {li.name}
                </Text>
                {show.itemDescription && li.description && (
                  <Text fontSize="12px" color="gray.300">
                    {li.description}
                  </Text>
                )}
              </Stack>
              <Text
                fontSize="13px"
                color={primaryColor}
                textAlign="right"
                fontWeight="500"
              >
                {Number(li.quantity).toFixed(2)}
              </Text>
              <Text
                fontSize="13px"
                color={primaryColor}
                textAlign="right"
                fontWeight="500"
              >
                {formatPlain(toNum(li.rate))}
              </Text>
              <Text fontSize="13px" color="gray.500" textAlign="right">
                {formatPlain(toNum(li.total))}
              </Text>
            </Grid>
          ))}
        </Box>
      </Box>

      {/* Totals — right-aligned, no outer box; vehicle details to the left */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify={shownVehicleRows.length > 0 ? "space-between" : "flex-end"}
        align={{ base: "stretch", md: "flex-start" }}
        gap="8"
        mb="10"
      >
        {shownVehicleRows.length > 0 && (
          <Box>
            <Text fontSize="13px" fontWeight="600" color={primaryColor} mb="2">
              {labels.vehicle}
            </Text>
            <Grid templateColumns="max-content 1fr" columnGap="6" rowGap="1.5">
              {shownVehicleRows.flatMap((row) => [
                <Text
                  key={`${row.label}-label`}
                  fontSize="12px"
                  color="gray.400"
                >
                  {row.label}
                </Text>,
                <Text
                  key={`${row.label}-value`}
                  fontSize="12px"
                  fontWeight="500"
                  color="gray.500"
                >
                  {row.value}
                </Text>,
              ])}
            </Grid>
          </Box>
        )}
        <Stack gap="0" w={{ base: "100%", md: "360px" }}>
          <TotalRow label="Sub Total" value={formatPlain(subtotal)} />
          {discountAmount > 0 && (
            <TotalRow
              label="Discount"
              value={`(-) ${formatPlain(discountAmount)}`}
            />
          )}
          {taxAmount > 0 && (
            <TotalRow label={taxLabel} value={formatPlain(taxAmount)} />
          )}
          {adjustment !== 0 && (
            <TotalRow
              label={invoice.adjustmentDescription || "Adjustment"}
              value={`${adjustment < 0 ? "(-) " : "+ "}${formatPlain(Math.abs(adjustment))}`}
            />
          )}
          <TotalRow
            label="Total"
            value={formatWithCode(total)}
            labelBold
            valueBold
          />

          {hasCarry ? (
            <>
              <TotalRow
                label="Balance on this invoice"
                value={formatPlain(balance)}
              />

              <Box borderTopWidth="1px" borderColor="gray.75" mt="2" pt="2">
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  color="gray.400"
                  px="3"
                  mb="1"
                >
                  Previous Balance
                </Text>
                {broughtForward.map((prev) => (
                  <TotalRow
                    key={prev.id}
                    label={prev.invoiceNumber}
                    value={formatPlain(toNum(prev.balance))}
                  />
                ))}
              </Box>

              <Box {...balanceBoxProps}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="13px" fontWeight="700" color="gray.500">
                    Total Due Now
                  </Text>
                  <Text fontSize="14px" fontWeight="700" color="gray.500">
                    {formatWithCode(totalDueNow)}
                  </Text>
                </Flex>
              </Box>
            </>
          ) : (
            <Box {...balanceBoxProps}>
              <Flex justify="space-between" align="center">
                <Text fontSize="13px" fontWeight="700" color="gray.500">
                  {labels.balanceDue}
                </Text>
                <Text fontSize="14px" fontWeight="700" color="gray.500">
                  {formatWithCode(balance)}
                </Text>
              </Flex>
            </Box>
          )}
        </Stack>
      </Flex>

      {/* Notes + primary bank account */}
      {(shownNotes || shownBank) && (
        <Box mb="6">
          <Text fontSize="13px" fontWeight="600" color={primaryColor} mb="2">
            {shownNotes ? labels.notes : labels.bank}
          </Text>
          {shownNotes && (
            <Text
              fontSize="12px"
              color="gray.400"
              whiteSpace="pre-line"
              lineHeight="1.6"
            >
              {notes}
            </Text>
          )}
          {shownBank && (
            <Stack gap="0" mt={shownNotes ? "4" : "0"}>
              <Text fontSize="12px" fontWeight="700" color="gray.500">
                {bankAccount?.accountNumber}
              </Text>
              {bankAccount?.bankName && (
                <Text fontSize="12px" color="gray.400">
                  {bankAccount.bankName}
                </Text>
              )}
              {bankAccount?.accountName && (
                <Text fontSize="12px" color="gray.400">
                  {bankAccount.accountName}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Terms */}
      {show.terms && terms && (
        <Box>
          <Text fontSize="13px" fontWeight="600" color={primaryColor} mb="2">
            {labels.terms}
          </Text>
          <Text
            fontSize="12px"
            color="gray.400"
            whiteSpace="pre-line"
            lineHeight="1.6"
          >
            {terms}
          </Text>
        </Box>
      )}

      {showRabbarBranding && (
        <Flex
          mt="10"
          pt="4"
          borderTopWidth="1px"
          borderColor="gray.75"
          align="center"
          justify="space-between"
          gap="3"
        >
          <Flex align="center" gap="2">
            <Text
              fontSize="10px"
              color="gray.300"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Powered by
            </Text>
            <Image src={rabbarLogo} alt="Rabbar Africa" h="13px" />
          </Flex>
          <Text asChild fontSize="11px" color="primary.400" fontWeight="600">
            <a href={RABBAR_SITE_URL} target="_blank" rel="noopener noreferrer">
              {RABBAR_SITE_DISPLAY}
            </a>
          </Text>
        </Flex>
      )}
    </Box>
  );
}

function MetaRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Flex justify="flex-end" gap="6" align="center">
      <Text fontSize="13px" color="gray.400">
        {label} :
      </Text>
      <Text
        fontSize="13px"
        color={color}
        fontWeight="500"
        minW="120px"
        textAlign="right"
      >
        {value}
      </Text>
    </Flex>
  );
}

function TotalRow({
  label,
  value,
  labelBold,
  valueBold,
}: {
  label: string;
  value: string;
  labelBold?: boolean;
  valueBold?: boolean;
}) {
  return (
    <Flex justify="space-between" align="center" px="3" py="2">
      <Text
        fontSize="13px"
        color="gray.500"
        fontWeight={labelBold ? "700" : "400"}
      >
        {label}
      </Text>
      <Text
        fontSize="13px"
        color="gray.500"
        fontWeight={valueBold ? "700" : "500"}
      >
        {value}
      </Text>
    </Flex>
  );
}
