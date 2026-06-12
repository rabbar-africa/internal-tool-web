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
import { formatAddress } from "@/utils/string-formatter";
import type { IOrganization } from "@/shared/interface/common";
import type { IPaymentReceived } from "@/shared/interface/payment";
import { pdfColors as c } from "./colors";
// Reuse the Poppins registration from the invoice PDF (same brand font).
import { registerPdfFonts } from "@/features/invoices/components/invoice-detail/pdf/registerFonts";

registerPdfFonts();

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v?: string) => (v ? moment(v).format("DD MMM YYYY") : "—");

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Cheque",
  ONLINE: "Online",
  OTHER: "Other",
};

const ribbonFor = (status: string) => {
  const s = (status || "").toUpperCase();
  if (["CONFIRMED", "COMPLETED", "PAID"].includes(s))
    return { label: "Paid", bg: c.ribbonPaid };
  if (["REFUNDED", "PARTIALLY_REFUNDED", "FAILED"].includes(s))
    return {
      label: s === "FAILED" ? "Failed" : "Refunded",
      bg: c.ribbonRefund,
    };
  return { label: "Draft", bg: c.ribbonDraft };
};

const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: 400,
    color: c.gray400,
  },

  // Status ribbon (rotated corner banner)
  ribbon: {
    position: "absolute",
    top: 22,
    left: -32,
    width: 140,
    transform: "rotate(-45deg)",
    color: c.white,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
    textAlign: "center",
    paddingVertical: 3,
  },

  // Org header
  headerRow: { flexDirection: "row", gap: 16, marginBottom: 28 },
  logo: {
    maxHeight: 80,
    maxWidth: 120,
    objectFit: "contain",
    objectPositionX: 0,
  },
  logoFallback: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: c.primary500,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: c.white, fontSize: 16, fontWeight: 700 },
  orgName: { fontSize: 15, fontWeight: 700, color: c.gray500 },
  orgLine: { fontSize: 9, color: c.gray300, marginTop: 2 },

  divider: { borderTopWidth: 1, borderColor: c.gray75, paddingTop: 24 },
  receiptTitle: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 2,
    color: c.gray400,
    fontWeight: 500,
    marginBottom: 24,
  },

  // Details + amount
  detailsRow: { flexDirection: "row", gap: 24, marginBottom: 28 },
  detailsCol: { flex: 1.4 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: c.gray75,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 10, color: c.gray300 },
  detailValue: { fontSize: 10, fontWeight: 600, color: c.gray500 },

  amountBox: {
    flex: 1,
    backgroundColor: c.amountBox,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  amountLabel: { fontSize: 10, color: c.white, marginBottom: 4 },
  amountValue: { fontSize: 18, fontWeight: 700, color: c.white },

  // Received from
  receivedLabel: { fontSize: 9, color: c.gray400 },
  receivedName: {
    fontSize: 13,
    fontWeight: 700,
    color: c.primary300,
    marginTop: 3,
  },

  // Payment for table
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: c.gray500,
    marginBottom: 8,
  },
  table: { borderWidth: 1, borderColor: c.gray75, borderRadius: 6 },
  thead: {
    flexDirection: "row",
    backgroundColor: c.gray50,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  trow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderColor: c.gray75,
    alignItems: "center",
  },
  th: { fontSize: 9, fontWeight: 600, color: c.gray400 },
  colInv: { width: "32%" },
  colDate: { width: "24%" },
  colAmt: { width: "22%", textAlign: "right" },
  cellInv: { fontSize: 10, fontWeight: 600, color: c.primary300 },
  cellDate: { fontSize: 10, color: c.gray400 },
  cellTotal: { fontSize: 10, color: c.gray500, textAlign: "right" },
  cellApplied: {
    fontSize: 10,
    fontWeight: 600,
    color: c.gray500,
    textAlign: "right",
  },

  // Notes
  notesLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: c.gray400,
    marginBottom: 3,
  },
  notesText: { fontSize: 9, color: c.gray400, lineHeight: 1.6 },
});

interface PaymentReceiptDocumentProps {
  payment: IPaymentReceived;
  organization?: IOrganization;
}

export function PaymentReceiptDocument({
  payment,
  organization,
}: PaymentReceiptDocumentProps) {
  const currencyCode = payment.currencyCode || organization?.currency;
  // Use the currency code (e.g. "NGN") rather than the ₦ symbol — the bundled
  // Poppins font has no Naira glyph, so the symbol renders as a broken box.
  const money = (n: number) =>
    formatMoney(n, { currencyCode, showCurrencyCode: true, showSymbol: false });

  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.country]
    .filter(Boolean)
    .join(", ");

  const allocations = payment.allocations ?? [];
  const outstanding = allocations.reduce(
    (sum, a) => sum + toNum(a.invoiceBalanceAfter),
    0,
  );
  const customerName =
    payment.customerName || payment.client?.displayName || "—";
  const ribbon = ribbonFor(payment.status);

  return (
    <Document title={`Receipt ${payment.paymentNumber || ""}`}>
      <Page size="A4" style={styles.page}>
        {/* Status ribbon */}
        <Text style={[styles.ribbon, { backgroundColor: ribbon.bg }]}>
          {ribbon.label}
        </Text>

        {/* Org header */}
        <View style={styles.headerRow}>
          {organization?.logoUrl ? (
            <Image src={organization.logoUrl} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>
                {organization?.name?.[0] ?? "R"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.orgName}>{organization?.name ?? "—"}</Text>
            {(orgAddress || orgLocation) && (
              <Text style={styles.orgLine}>{orgAddress || orgLocation}</Text>
            )}
            {(organization?.companyEmail || organization?.email) && (
              <Text style={styles.orgLine}>
                {organization?.companyEmail || organization?.email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider}>
          <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>

          {/* Details + amount */}
          <View style={styles.detailsRow}>
            <View style={styles.detailsCol}>
              <DetailRow
                label="Receipt #"
                value={payment.paymentNumber || "—"}
              />
              <DetailRow
                label="Payment Date"
                value={formatDate(payment.date)}
              />
              <DetailRow
                label="Payment Mode"
                value={MODE_LABELS[payment.mode] ?? payment.mode}
              />
              <DetailRow
                label="Outstanding Balance"
                value={money(outstanding)}
                last
              />
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Amount Received</Text>
              <Text style={styles.amountValue}>
                {money(toNum(payment.amount))}
              </Text>
            </View>
          </View>

          {/* Received from */}
          <View style={{ marginBottom: 28 }}>
            <Text style={styles.receivedLabel}>Received From</Text>
            <Text style={styles.receivedName}>{customerName}</Text>
          </View>

          {/* Payment for */}
          {allocations.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Payment for</Text>
              <View style={styles.table}>
                <View style={styles.thead}>
                  <Text style={[styles.th, styles.colInv]}>Invoice Number</Text>
                  <Text style={[styles.th, styles.colDate]}>Invoice Date</Text>
                  <Text style={[styles.th, styles.colAmt]}>Invoice Amount</Text>
                  <Text style={[styles.th, styles.colAmt]}>Payment Amount</Text>
                </View>
                {allocations.map((a) => (
                  <View key={a.id} style={styles.trow} wrap={false}>
                    <Text style={[styles.cellInv, styles.colInv]}>
                      {a.invoice?.invoiceNumber ?? "—"}
                    </Text>
                    <Text style={[styles.cellDate, styles.colDate]}>
                      {formatDate(a.invoice?.date)}
                    </Text>
                    <Text style={[styles.cellTotal, styles.colAmt]}>
                      {money(toNum(a.invoice?.total))}
                    </Text>
                    <Text style={[styles.cellApplied, styles.colAmt]}>
                      {money(toNum(a.amountApplied))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {payment.notes ? (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{payment.notes}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last ? styles.detailRowLast : {}]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
