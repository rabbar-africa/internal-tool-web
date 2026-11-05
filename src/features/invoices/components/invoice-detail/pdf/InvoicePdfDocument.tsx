/**
 * Invoice PDF, generated in the browser.
 *
 * Must look exactly like the WhatsApp bot's copy:
 *   internal-tool-backend/src/invoices/pdf/invoice-pdf.document.tsx
 * Change the two together.
 */
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import rabbarLogo from "@/assets/logo.png";
import {
  RABBAR_JOBCARD_DISPLAY,
  RABBAR_JOBCARD_URL,
} from "@/shared/constants/brand";
import moment from "moment";
import { formatMoney } from "@/hooks/useFormatMoney";
import type { IOrganization } from "@/shared/interface/common";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { formatAddress } from "@/utils/string-formatter";
import {
  applyStyleOverrides,
  invoicePdfStyleOverrides,
  normalizeInvoiceDesign,
} from "@/features/invoices/utils/invoice-design";
import { pdfColors as c } from "./colors";
import { registerPdfFonts } from "./registerFonts";

registerPdfFonts();

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
// Dates are stored without a time, so read them in UTC: in local time a user west
// of UTC would see the day before, and the backend's copy wouldn't match.
const formatDate = (v: string) => {
  const date = moment.utc(v);
  return v && date.isValid() ? date.format("DD MMM YYYY") : "—";
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 36,
    paddingVertical: 36,
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: 400,
    color: c.gray400,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  brandCol: { width: "50%" },
  logo: {
    maxHeight: 52,
    maxWidth: 90,
    marginBottom: 8,
    objectFit: "contain",
    objectPositionX: 0,
    alignSelf: "flex-start",
  },
  logoFallback: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: c.primary500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoFallbackText: { color: c.white, fontSize: 12, fontWeight: 600 },
  orgName: { fontSize: 11, fontWeight: 700, color: c.gray500 },
  orgLine: { fontSize: 8, color: c.gray400, marginTop: 1.5 },
  billLine: { fontSize: 8, color: c.gray400, marginTop: 3 },

  metaCol: { width: "50%", alignItems: "flex-end" },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: c.gray500,
    marginBottom: 2,
  },
  invoiceNumber: { fontSize: 10, fontWeight: 600, color: c.gray500 },
  balanceLabel: {
    fontSize: 9,
    fontWeight: 500,
    color: c.gray300,
    marginTop: 10,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 700,
    color: c.gray500,
    marginTop: 2,
  },

  // Bill-to / meta — bottom-aligned, mirroring the on-screen `justify="flex-end"`
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  billCol: { width: "50%" },
  label: { fontSize: 9, color: c.gray400 },
  billName: { fontSize: 11, fontWeight: 700, color: c.gray500, marginTop: 3 },

  metaInfoCol: { width: "50%" },
  metaLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  metaLabel: { fontSize: 9, color: c.gray400, marginRight: 18 },
  metaValue: {
    fontSize: 9,
    fontWeight: 500,
    color: c.primary400,
    minWidth: 90,
    textAlign: "right",
  },

  // Table
  tableHead: {
    flexDirection: "row",
    backgroundColor: c.gray500,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  th: { fontSize: 8, fontWeight: 500, color: c.white },
  row: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.gray75,
  },
  colIndex: { width: "8%" },
  colName: { width: "44%" },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "18%", textAlign: "right" },
  colAmount: { width: "18%", textAlign: "right" },
  itemName: { fontSize: 9, fontWeight: 600, color: c.gray500 },
  itemDesc: { fontSize: 8, color: c.gray300, marginTop: 1.5 },
  cellAccent: { fontSize: 9, fontWeight: 500, color: c.primary400 },
  cellMuted: { fontSize: 9, color: c.gray500 },

  // Totals
  vehicleInfo: { width: 240 },
  vehicleInfoRow: { flexDirection: "row", marginBottom: 3 },
  vehicleInfoLabel: { fontSize: 8, color: c.gray400, width: 55 },
  vehicleInfoValue: { fontSize: 8, fontWeight: 500, color: c.gray500, flex: 1 },
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  totals: { width: 230 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 9, color: c.gray500 },
  totalValue: { fontSize: 9, fontWeight: 500, color: c.gray500 },
  bold: { fontWeight: 700 },
  balanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: c.gray50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    marginTop: 4,
  },

  // Previous balance (invoices carried onto this one)
  carryBlock: {
    borderTopWidth: 1,
    borderTopColor: c.gray75,
    marginTop: 4,
    paddingTop: 4,
  },
  carryTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: c.gray400,
    paddingHorizontal: 10,
    marginBottom: 2,
  },

  // Starter-plan branding. `pageBranded` reserves room for the footer so
  // content never runs underneath it.
  pageBranded: { paddingBottom: 64 },
  brandFooter: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: c.gray75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandFooterLeft: { flexDirection: "row", alignItems: "center" },
  brandPoweredBy: {
    fontSize: 7,
    color: c.gray300,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginRight: 7,
  },
  brandFooterLogo: { width: 56, height: 11, objectFit: "contain" },
  brandFooterLink: {
    fontSize: 7.5,
    color: c.primary400,
    textDecoration: "none",
    fontWeight: 600,
  },

  // Footer blocks
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: c.primary400,
    marginBottom: 4,
  },
  sectionText: { fontSize: 8, color: c.gray400, lineHeight: 1.5 },
  bankLine: { fontSize: 8, color: c.gray400, marginTop: 1.5 },
  bankAccountNumber: { fontSize: 8, fontWeight: 700, color: c.gray500 },
});

interface InvoicePdfDocumentProps {
  invoice: IInvoiceResponse;
  organization?: IOrganization;
  /** Starter (free) plan invoices carry a small Rabbar credit. */
  showRabbarBranding?: boolean;
  /** Terms & conditions are a plan feature; the backend PDF drops them too. */
  showTerms?: boolean;
}

export function InvoicePdfDocument({
  invoice,
  organization,
  showRabbarBranding = false,
  showTerms = true,
}: InvoicePdfDocumentProps) {
  const client = invoice.client;
  const currencyCode = invoice.currencyCode || organization?.currency;
  // The API can return a non-string (e.g. an empty object) for billingAddress
  // despite its declared type. Only render a genuine, non-empty string —
  // rendering an object as a child throws React error #31 inside react-pdf.
  const billingAddress =
    typeof invoice.billingAddress === "string"
      ? invoice.billingAddress.trim()
      : "";

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

  const orgConfig = organization?.config;
  // The account this invoice asks to be paid into; older ones fall back to
  // the primary, as the backend PDF does.
  const bankAccount = invoice.bankAccount ?? organization?.primaryBankAccount;
  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.country]
    .filter(Boolean)
    .join(" , ");

  const notes = invoice.notes || orgConfig?.invoiceNotesDefault;

  // Vehicle details shown beside the totals. Unrecorded fields are left out.
  const vehicleRows = invoice.vehicle
    ? [
        { label: "Make", value: invoice.vehicle.make?.trim() },
        { label: "Model", value: invoice.vehicle.model?.trim() },
        {
          label: "Year",
          value: invoice.vehicle.year ? String(invoice.vehicle.year) : "",
        },
        {
          label: "Plate No.",
          value: invoice.vehicle.registrationNumber?.trim(),
        },
      ].filter((row) => row.value)
    : [];
  const terms = showTerms
    ? invoice.terms || orgConfig?.invoiceTermsDefault
    : null;

  const plain = (n: number) =>
    formatMoney(n, { currencyCode, showSymbol: false });
  const withCode = (n: number) =>
    formatMoney(n, { currencyCode, showCurrencyCode: true, showSymbol: false });

  const design = normalizeInvoiceDesign(invoice.design);
  const { show, labels } = design;
  const s = applyStyleOverrides(styles, invoicePdfStyleOverrides(design));
  const shownVehicleRows = show.vehicle ? vehicleRows : [];

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page
        size="A4"
        style={showRabbarBranding ? [s.page, s.pageBranded] : s.page}
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.brandCol}>
            {!show.logo ? null : organization?.logoUrl ? (
              <Image src={organization.logoUrl} style={s.logo} />
            ) : (
              <View style={s.logoFallback}>
                <Text style={s.logoFallbackText}>
                  {organization?.name?.[0] ?? "R"}
                </Text>
              </View>
            )}
            <Text style={s.orgName}>{organization?.name ?? "—"}</Text>
            {show.rcNumber && organization?.rcNumber ? (
              <Text style={s.orgLine}>RC: {organization.rcNumber}</Text>
            ) : null}
            {!show.orgAddress ? null : orgAddress ? (
              <Text style={s.orgLine}>{orgAddress}</Text>
            ) : orgLocation ? (
              <Text style={s.orgLine}>{orgLocation}</Text>
            ) : null}
            {show.orgContact &&
            (organization?.companyEmail || organization?.email) ? (
              <Text style={s.orgLine}>
                {organization?.companyEmail || organization?.email}
              </Text>
            ) : null}
            {show.orgContact && organization?.phone ? (
              <Text style={s.orgLine}>{organization.phone}</Text>
            ) : null}
            {show.orgContact && organization?.website ? (
              <Text style={s.orgLine}>{organization.website}</Text>
            ) : null}
          </View>

          <View style={s.metaCol}>
            <Text style={s.invoiceTitle}>{labels.title}</Text>
            <Text style={s.invoiceNumber}># {invoice.invoiceNumber}</Text>
            <Text style={s.balanceLabel}>
              {hasCarry ? "Total Due Now" : labels.balanceDue}
            </Text>
            <Text style={s.balanceValue}>
              {withCode(hasCarry ? totalDueNow : balance)}
            </Text>
          </View>
        </View>

        {/* Bill To + meta */}
        <View style={s.infoRow}>
          <View style={s.billCol}>
            <Text style={s.label}>{labels.billTo}</Text>
            <Text style={s.billName}>
              {client?.displayName ?? invoice.customerName ?? "—"}
            </Text>
            {show.billingAddress && billingAddress ? (
              <Text style={s.billLine}>{billingAddress}</Text>
            ) : null}
          </View>

          <View style={s.metaInfoCol}>
            <MetaRow
              s={s}
              label={labels.invoiceDate}
              value={formatDate(invoice.date)}
            />
            {show.paymentTerms ? (
              <MetaRow
                s={s}
                label={labels.paymentTerms}
                value={
                  invoice.paymentTermsLabel ||
                  `Net ${invoice.paymentTerms ?? 0}`
                }
              />
            ) : null}
            {show.dueDate ? (
              <MetaRow
                s={s}
                label={labels.dueDate}
                value={formatDate(invoice.dueDate)}
              />
            ) : null}
          </View>
        </View>

        {/* Line items */}
        <View>
          <View style={s.tableHead}>
            <Text style={[s.th, s.colIndex]}>#</Text>
            <Text style={[s.th, s.colName]}>{labels.items}</Text>
            <Text style={[s.th, s.colQty]}>{labels.quantity}</Text>
            <Text style={[s.th, s.colRate]}>{labels.rate}</Text>
            <Text style={[s.th, s.colAmount]}>{labels.amount}</Text>
          </View>

          {invoice.lineItems?.map((li, idx) => (
            <View key={li.id} style={s.row} wrap={false}>
              <Text style={[s.cellAccent, s.colIndex]}>{idx + 1}</Text>
              <View style={s.colName}>
                <Text style={s.itemName}>{li.name}</Text>
                {show.itemDescription && li.description ? (
                  <Text style={s.itemDesc}>{li.description}</Text>
                ) : null}
              </View>
              <Text style={[s.cellAccent, s.colQty]}>
                {toNum(li.quantity).toFixed(2)}
              </Text>
              <Text style={[s.cellAccent, s.colRate]}>
                {plain(toNum(li.rate))}
              </Text>
              <Text style={[s.cellMuted, s.colAmount]}>
                {plain(toNum(li.total))}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View
          style={
            shownVehicleRows.length > 0
              ? [s.totalsWrap, { justifyContent: "space-between" }]
              : s.totalsWrap
          }
        >
          {shownVehicleRows.length > 0 ? (
            <View style={s.vehicleInfo}>
              <Text style={s.sectionTitle}>{labels.vehicle}</Text>
              {shownVehicleRows.map((row) => (
                <View key={row.label} style={s.vehicleInfoRow}>
                  <Text style={s.vehicleInfoLabel}>{row.label}</Text>
                  <Text style={s.vehicleInfoValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={s.totals}>
            <TotalRow s={s} label="Sub Total" value={plain(subtotal)} />
            {discountAmount > 0 ? (
              <TotalRow
                s={s}
                label="Discount"
                value={`(-) ${plain(discountAmount)}`}
              />
            ) : null}
            {taxAmount > 0 ? (
              <TotalRow s={s} label={taxLabel} value={plain(taxAmount)} />
            ) : null}
            {adjustment !== 0 ? (
              <TotalRow
                s={s}
                label={invoice.adjustmentDescription || "Adjustment"}
                value={`${adjustment < 0 ? "(-) " : "+ "}${plain(
                  Math.abs(adjustment),
                )}`}
              />
            ) : null}
            <TotalRow s={s} label="Total" value={withCode(total)} bold />

            {hasCarry ? (
              <>
                <TotalRow
                  s={s}
                  label="Balance on this invoice"
                  value={plain(balance)}
                />

                <View style={s.carryBlock}>
                  <Text style={s.carryTitle}>Previous Balance</Text>
                  {broughtForward.map((prev) => (
                    <TotalRow
                      s={s}
                      key={prev.id}
                      label={prev.invoiceNumber}
                      value={plain(toNum(prev.balance))}
                    />
                  ))}
                </View>

                <View style={s.balanceBox}>
                  <Text style={[s.totalLabel, s.bold]}>Total Due Now</Text>
                  <Text style={[s.totalValue, s.bold]}>
                    {withCode(totalDueNow)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={s.balanceBox}>
                <Text style={[s.totalLabel, s.bold]}>{labels.balanceDue}</Text>
                <Text style={[s.totalValue, s.bold]}>{withCode(balance)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Account details */}
        {show.bankDetails && bankAccount?.accountNumber ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.bank}</Text>
            <Text style={s.bankAccountNumber}>{bankAccount.accountNumber}</Text>
            {bankAccount.bankName ? (
              <Text style={s.bankLine}>{bankAccount.bankName}</Text>
            ) : null}
            {bankAccount.accountName ? (
              <Text style={s.bankLine}>{bankAccount.accountName}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Notes */}
        {show.notes && notes ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.notes}</Text>
            <Text style={s.sectionText}>{notes}</Text>
          </View>
        ) : null}

        {/* Terms */}
        {show.terms && terms ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.terms}</Text>
            <Text style={s.sectionText}>{terms}</Text>
          </View>
        ) : null}
        {showRabbarBranding ? (
          <View style={s.brandFooter} fixed>
            <View style={s.brandFooterLeft}>
              <Text style={s.brandPoweredBy}>Powered by</Text>
              <Image src={rabbarLogo} style={s.brandFooterLogo} />
            </View>
            <Link src={RABBAR_JOBCARD_URL} style={s.brandFooterLink}>
              {RABBAR_JOBCARD_DISPLAY}
            </Link>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function MetaRow({
  s,
  label,
  value,
}: {
  s: typeof styles;
  label: string;
  value: string;
}) {
  return (
    <View style={s.metaLine}>
      <Text style={s.metaLabel}>{label} :</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function TotalRow({
  s,
  label,
  value,
  bold,
}: {
  s: typeof styles;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={s.totalRow}>
      <Text style={[s.totalLabel, bold ? s.bold : {}]}>{label}</Text>
      <Text style={[s.totalValue, bold ? s.bold : {}]}>{value}</Text>
    </View>
  );
}
