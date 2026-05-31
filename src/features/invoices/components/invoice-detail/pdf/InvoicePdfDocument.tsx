import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import moment from "moment";
import { formatMoney } from "@/hooks/useFormatMoney";
import type { IOrganization } from "@/shared/interface/common";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { formatAddress } from "@/utils/string-formatter";
import { pdfColors as c } from "./colors";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v: string) => (v ? moment(v).format("DD MMM YYYY") : "—");

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: c.gray400,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  brandCol: { width: "55%" },
  logo: {
    maxHeight: 64,
    maxWidth: 110,
    marginBottom: 10,
    objectFit: "contain",
  },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: 4,
    backgroundColor: c.primary500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoFallbackText: {
    color: c.white,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  orgName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: c.gray500 },
  orgLine: { fontSize: 9, color: c.gray400, marginTop: 1.5 },

  metaCol: { width: "40%", alignItems: "flex-end" },
  invoiceTitle: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: c.gray500,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.gray500,
  },
  balanceLabel: { fontSize: 10, color: c.gray300, marginTop: 14 },
  balanceValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: c.gray500,
    marginTop: 2,
  },

  // Bill-to / meta
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  billCol: { width: "55%" },
  label: { fontSize: 10, color: c.gray400 },
  billName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: c.gray500,
    marginTop: 3,
  },

  metaInfoCol: { width: "45%" },
  metaLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  metaLabel: { fontSize: 10, color: c.gray400, marginRight: 18 },
  metaValue: {
    fontSize: 10,
    color: c.primary400,
    fontFamily: "Helvetica-Bold",
    minWidth: 90,
    textAlign: "right",
  },

  // Table
  tableHead: {
    flexDirection: "row",
    backgroundColor: c.gray500,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  th: { fontSize: 9, color: c.white },
  row: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: c.gray75,
  },
  colIndex: { width: "8%" },
  colName: { width: "44%" },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "18%", textAlign: "right" },
  colAmount: { width: "18%", textAlign: "right" },
  itemName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.gray500 },
  itemDesc: { fontSize: 9, color: c.gray300, marginTop: 1.5 },
  cellAccent: { fontSize: 10, color: c.primary400 },
  cellMuted: { fontSize: 10, color: c.gray500 },

  // Totals
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  totals: { width: 240 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  totalLabel: { fontSize: 10, color: c.gray500 },
  totalValue: { fontSize: 10, color: c.gray500 },
  bold: { fontFamily: "Helvetica-Bold" },
  balanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: c.gray50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 2,
    marginTop: 4,
  },

  // Footer blocks
  section: { marginTop: 26 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.primary400,
    marginBottom: 5,
  },
  sectionText: { fontSize: 9, color: c.gray400, lineHeight: 1.5 },
  bankLine: { fontSize: 9, color: c.gray400, marginTop: 1.5 },
  bankAccountNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.gray500,
  },
});

interface InvoicePdfDocumentProps {
  invoice: IInvoiceResponse;
  organization?: IOrganization;
}

export function InvoicePdfDocument({
  invoice,
  organization,
}: InvoicePdfDocumentProps) {
  const client = invoice.client;
  const currencyCode = invoice.currencyCode || organization?.currency;

  const subtotal = toNum(invoice.subTotal);
  const discountAmount = toNum(invoice.discount);
  const taxAmount = toNum(invoice.taxAmount);
  const adjustment = toNum(invoice.adjustment);
  const total = toNum(invoice.total);
  const balance = toNum(invoice.balance);

  const orgConfig = organization?.config;
  const bankAccount = organization?.primaryBankAccount;
  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.country]
    .filter(Boolean)
    .join(" , ");

  const notes = invoice.notes || orgConfig?.invoiceNotesDefault;
  const terms = invoice.terms || orgConfig?.invoiceTermsDefault;

  const plain = (n: number) =>
    formatMoney(n, { currencyCode, showSymbol: false });
  const withCode = (n: number) =>
    formatMoney(n, { currencyCode, showCurrencyCode: true, showSymbol: false });

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandCol}>
            {organization?.logoUrl ? (
              <Image src={organization.logoUrl} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>
                  {organization?.name?.[0] ?? "R"}
                </Text>
              </View>
            )}
            <Text style={styles.orgName}>{organization?.name ?? "—"}</Text>
            {organization?.rcNumber ? (
              <Text style={styles.orgLine}>RC: {organization.rcNumber}</Text>
            ) : null}
            {orgAddress ? (
              <Text style={styles.orgLine}>{orgAddress}</Text>
            ) : orgLocation ? (
              <Text style={styles.orgLine}>{orgLocation}</Text>
            ) : null}
            {organization?.companyEmail || organization?.email ? (
              <Text style={styles.orgLine}>
                {organization?.companyEmail || organization?.email}
              </Text>
            ) : null}
            {organization?.phone ? (
              <Text style={styles.orgLine}>{organization.phone}</Text>
            ) : null}
            {organization?.website ? (
              <Text style={styles.orgLine}>{organization.website}</Text>
            ) : null}
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}># {invoice.invoiceNumber}</Text>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>{withCode(balance)}</Text>
          </View>
        </View>

        {/* Bill To + meta */}
        <View style={styles.infoRow}>
          <View style={styles.billCol}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.billName}>
              {client?.displayName ?? invoice.customerName ?? "—"}
            </Text>
            {invoice.billingAddress ? (
              <Text style={[styles.orgLine, { marginTop: 3 }]}>
                {invoice.billingAddress}
              </Text>
            ) : null}
          </View>

          <View style={styles.metaInfoCol}>
            <MetaRow label="Invoice Date" value={formatDate(invoice.date)} />
            <MetaRow
              label="Terms"
              value={
                invoice.paymentTermsLabel || `Net ${invoice.paymentTerms ?? 0}`
              }
            />
            <MetaRow label="Due Date" value={formatDate(invoice.dueDate)} />
          </View>
        </View>

        {/* Line items */}
        <View>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colIndex]}>#</Text>
            <Text style={[styles.th, styles.colName]}>
              Item &amp; Description
            </Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>

          {invoice.lineItems?.map((li, idx) => (
            <View key={li.id} style={styles.row} wrap={false}>
              <Text style={[styles.cellAccent, styles.colIndex]}>
                {idx + 1}
              </Text>
              <View style={styles.colName}>
                <Text style={styles.itemName}>{li.name}</Text>
                {li.description ? (
                  <Text style={styles.itemDesc}>{li.description}</Text>
                ) : null}
              </View>
              <Text style={[styles.cellAccent, styles.colQty]}>
                {Number(li.quantity).toFixed(2)}
              </Text>
              <Text style={[styles.cellAccent, styles.colRate]}>
                {plain(toNum(li.rate))}
              </Text>
              <Text style={[styles.cellMuted, styles.colAmount]}>
                {plain(toNum(li.total))}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <TotalRow label="Sub Total" value={plain(subtotal)} />
            {discountAmount > 0 ? (
              <TotalRow
                label="Discount"
                value={`(-) ${plain(discountAmount)}`}
              />
            ) : null}
            {taxAmount > 0 ? (
              <TotalRow label="VAT" value={plain(taxAmount)} />
            ) : null}
            {adjustment !== 0 ? (
              <TotalRow
                label={invoice.adjustmentDescription || "Adjustment"}
                value={`${adjustment < 0 ? "(-) " : "+ "}${plain(
                  Math.abs(adjustment),
                )}`}
              />
            ) : null}
            <TotalRow label="Total" value={withCode(total)} bold />
            <View style={styles.balanceBox}>
              <Text style={[styles.totalLabel, styles.bold]}>Balance Due</Text>
              <Text style={[styles.totalValue, styles.bold]}>
                {withCode(balance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes + bank account */}
        {notes || bankAccount ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {notes ? <Text style={styles.sectionText}>{notes}</Text> : null}
            {bankAccount ? (
              <View style={{ marginTop: notes ? 8 : 0 }}>
                <Text style={styles.bankAccountNumber}>
                  {bankAccount.accountNumber}
                </Text>
                {bankAccount.bankName ? (
                  <Text style={styles.bankLine}>{bankAccount.bankName}</Text>
                ) : null}
                {bankAccount.accountName ? (
                  <Text style={styles.bankLine}>{bankAccount.accountName}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Terms */}
        {terms ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            <Text style={styles.sectionText}>{terms}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaLine}>
      <Text style={styles.metaLabel}>{label} :</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function TotalRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold ? styles.bold : {}]}>{label}</Text>
      <Text style={[styles.totalValue, bold ? styles.bold : {}]}>{value}</Text>
    </View>
  );
}
