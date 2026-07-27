import {
  Document,
  Page,
  View,
  Text,
  Image,
  Svg,
  Path,
  Circle,
  StyleSheet,
} from "@react-pdf/renderer";
import moment from "moment";
import type { IOrganization } from "@/shared/interface/common";
import type {
  IInspection,
  IInspectionFinding,
} from "@/shared/interface/inspection";
import { formatAddress } from "@/utils/string-formatter";
import { pdfColors as c } from "@/features/invoices/components/invoice-detail/pdf/colors";
import { registerPdfFonts } from "@/features/invoices/components/invoice-detail/pdf/registerFonts";

registerPdfFonts();

// Status palette — reserved semantic colors (print-friendly, from the theme).
// Every status is always rendered as icon + label, never color alone.
const status = {
  pass: "#2E7D43",
  warning: "#B58A3C",
  fail: "#C62828",
} as const;

type Bucket = keyof typeof status;

// Map the free-text finding statuses onto pass / warning / fail buckets.
const STATUS_BUCKET: Record<string, Bucket> = {
  good: "pass",
  faulty_repaired: "pass",
  faulty_replaced: "pass",
  needs_attention: "warning",
  worn_out: "warning",
  needs_repair: "fail",
  needs_replacement: "fail",
  damaged: "fail",
  missing: "fail",
  not_genuine: "fail",
};

const normalizeStatus = (s?: string): Bucket =>
  STATUS_BUCKET[s?.toLowerCase?.() ?? ""] ?? "warning";

const prettyStatus = (s?: string) =>
  (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

const formatDate = (v?: string) => (v ? moment(v).format("DD MMM YYYY") : "");

// Convert notes HTML (rich-text / AI) to plain text — react-pdf can't render HTML.
const htmlToText = (html?: string): string => {
  if (!html) return "";
  return html
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ─── Status icon (always paired with a text label) ───────────────────────────
function StatusIcon({ bucket, size = 10 }: { bucket: Bucket; size?: number }) {
  const color = status[bucket];
  if (bucket === "pass") {
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth={1.5} />
        <Path
          d="M5 8l2 2 4-4"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (bucket === "warning") {
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Path
          d="M8 2.5L13.5 13H2.5L8 2.5z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Path
          d="M8 6.5v3"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Circle cx="8" cy="11" r="0.75" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth={1.5} />
      <Path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Styles — mirrors the invoice PDF's house style ──────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 36,
    paddingTop: 0,
    paddingBottom: 40,
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: 400,
    color: c.gray400,
    backgroundColor: c.white,
  },
  // Thin brand band across the very top of every page.
  brandBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: c.primary500,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 34,
    marginBottom: 6,
  },
  brandCol: { width: "50%" },
  logo: {
    maxHeight: 48,
    maxWidth: 90,
    marginBottom: 8,
    objectFit: "contain",
    objectPositionX: 0,
    alignSelf: "flex-start",
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: c.primary500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoFallbackText: { color: c.white, fontSize: 12, fontWeight: 600 },
  orgName: { fontSize: 11, fontWeight: 700, color: c.gray500 },
  orgLine: { fontSize: 8, color: c.gray400, marginTop: 1.5 },

  metaCol: { width: "50%", alignItems: "flex-end" },
  docTitle: {
    fontSize: 21,
    fontWeight: 600,
    color: c.gray500,
    marginBottom: 2,
  },
  docNumber: { fontSize: 10, fontWeight: 600, color: c.gray500 },
  metaLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  metaLabel: { fontSize: 9, color: c.gray400, marginRight: 14 },
  // No minWidth here: with the row packed flex-end, a minWidth wider than the
  // text makes react-pdf reserve the extra space AFTER the value, pushing it
  // off the right margin.
  metaValue: {
    fontSize: 9,
    fontWeight: 500,
    color: c.primary400,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: c.gray75,
    marginTop: 12,
    marginBottom: 16,
  },

  // Section titles (same voice as the invoice)
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: c.primary400,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  // Vehicle / Owner info
  infoRow: { flexDirection: "row", gap: 28, marginBottom: 18 },
  infoCol: { flex: 1 },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: c.gray50,
  },
  infoKey: { fontSize: 8.5, color: c.gray300 },
  infoVal: {
    fontSize: 8.5,
    fontWeight: 500,
    color: c.gray500,
    textAlign: "right",
    maxWidth: "62%",
  },

  // Summary stat tiles — neutral chrome, colored accent + icon only.
  statRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.gray75,
    borderLeftWidth: 3,
    borderRadius: 3,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  statHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  statLabel: {
    fontSize: 7,
    fontWeight: 500,
    color: c.gray400,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statValue: { fontSize: 17, fontWeight: 600, color: c.gray500, marginTop: 4 },
  statSub: { fontSize: 7.5, color: c.gray300, marginTop: 1 },

  // Findings table (same language as the invoice line-items table)
  checksHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  counts: { flexDirection: "row", gap: 12, alignItems: "center" },
  count: { flexDirection: "row", alignItems: "center", gap: 3.5 },
  countText: { fontSize: 8, fontWeight: 500 },

  tableHead: {
    flexDirection: "row",
    backgroundColor: c.gray500,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  th: { fontSize: 8, fontWeight: 500, color: c.white },
  row: {
    flexDirection: "row",
    // Vertically center every cell when a long observation wraps to multiple lines.
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.gray75,
  },
  colIndex: { width: "6%" },
  colComponent: { width: "34%", paddingRight: 8 },
  colStatus: { width: "24%" },
  colObservation: { width: "36%" },
  cellIndex: { fontSize: 9, fontWeight: 500, color: c.primary400 },
  cellComponent: { fontSize: 9, fontWeight: 600, color: c.gray500 },
  cellStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  cellStatusText: { fontSize: 8.5, fontWeight: 500 },
  cellObservation: { fontSize: 8.5, color: c.gray400, lineHeight: 1.4 },
  emptyChecks: {
    fontSize: 9,
    color: c.gray300,
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.gray75,
  },

  // Notes
  section: { marginTop: 18 },
  notesText: { fontSize: 8.5, color: c.gray400, lineHeight: 1.6 },

  // Disclaimer / footer
  disclaimer: {
    marginTop: 22,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.gray75,
  },
  disclaimerText: { fontSize: 7, color: c.gray300, lineHeight: 1.6 },
  footerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footerMeta: { fontSize: 7, color: c.gray300 },
});

interface InspectionPdfDocumentProps {
  inspection: IInspection;
  organization?: IOrganization;
}

export function InspectionPdfDocument({
  inspection,
  organization,
}: InspectionPdfDocumentProps) {
  const findings = inspection.findings ?? [];
  const passCount = findings.filter(
    (f) => normalizeStatus(f.status) === "pass",
  ).length;
  const warnCount = findings.filter(
    (f) => normalizeStatus(f.status) === "warning",
  ).length;
  const failCount = findings.filter(
    (f) => normalizeStatus(f.status) === "fail",
  ).length;

  const vehicleName = [inspection.vehicleMake, inspection.vehicleModel]
    .filter(Boolean)
    .join(" ");
  const fullVehicleName = inspection.vehicleYear
    ? `${inspection.vehicleYear} ${vehicleName}`.trim()
    : vehicleName;

  const notes = htmlToText(inspection.generalNotes);
  const formattedDate = formatDate(inspection.inspectionDate);

  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.country]
    .filter(Boolean)
    .join(", ");

  // Summary tiles are shown dynamically: zero-count buckets are dropped, and
  // the whole row only renders when at least two buckets have counts (a single
  // populated bucket carries no comparative information).
  const allStatCards: {
    label: string;
    value: number;
    sub: string;
    bucket: Bucket;
  }[] = [
    {
      label: "Immediate Attention",
      value: failCount,
      sub: failCount === 1 ? "item" : "items",
      bucket: "fail",
    },
    {
      label: "Monitor",
      value: warnCount,
      sub: warnCount === 1 ? "item" : "items",
      bucket: "warning",
    },
    { label: "Passed", value: passCount, sub: "checks", bucket: "pass" },
  ];
  const statCards = allStatCards.filter((s) => s.value > 0);
  const showSummary = statCards.length >= 2;

  const countChips = allStatCards.filter((s) => s.value > 0);

  return (
    <Document title={`Inspection Report ${inspection.jobCode ?? ""}`.trim()}>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandBand} fixed />

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
            <Text style={styles.orgName}>{organization?.name ?? ""}</Text>
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
            <Text style={styles.docTitle}>Inspection Report</Text>
            {inspection.jobCode ? (
              <Text style={styles.docNumber}>
                REPORT - # {inspection.jobCode}
              </Text>
            ) : null}
            {/* Full-width so every value's right edge sits on the page margin. */}
            <View style={{ marginTop: 8, alignSelf: "stretch" }}>
              {formattedDate ? (
                <MetaRow label="Inspection Date" value={formattedDate} />
              ) : null}
              {inspection.technicianName ? (
                <MetaRow label="Technician" value={inspection.technicianName} />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Vehicle + Owner */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <InfoLine label="Make / Model" value={fullVehicleName} />
            <InfoLine
              label="Reg. Number"
              value={inspection.vehicleRegistrationNumber}
            />
            <InfoLine label="Color" value={inspection.vehicleColor} />
            <InfoLine label="VIN" value={inspection.vehicleVin} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <InfoLine label="Name" value={inspection.customerName} />
            <InfoLine label="Phone" value={inspection.customerPhone} />
            <InfoLine label="Email" value={inspection.customerEmail} />
          </View>
        </View>

        {/* Summary — only when ≥2 buckets have counts */}
        {showSummary ? (
          <View style={styles.statRow}>
            {statCards.map((s) => (
              <View
                key={s.bucket}
                style={[styles.statCard, { borderLeftColor: status[s.bucket] }]}
              >
                <View style={styles.statHead}>
                  <StatusIcon bucket={s.bucket} size={9} />
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Findings table */}
        <View>
          <View style={styles.checksHead}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              System Checks
            </Text>
            <View style={styles.counts}>
              {countChips.map((s) => (
                <View key={s.bucket} style={styles.count}>
                  <StatusIcon bucket={s.bucket} size={9} />
                  <Text style={[styles.countText, { color: status[s.bucket] }]}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colIndex]}>#</Text>
            <Text style={[styles.th, styles.colComponent]}>Component</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
            <Text style={[styles.th, styles.colObservation]}>Observation</Text>
          </View>

          {findings.length === 0 ? (
            <Text style={styles.emptyChecks}>No findings recorded.</Text>
          ) : (
            findings.map((f, idx) => (
              <FindingRow key={idx} finding={f} index={idx} />
            ))
          )}
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              Technician Notes &amp; Recommendations
            </Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* Disclaimer */}
        <View style={styles.disclaimer} wrap={false}>
          <Text style={styles.disclaimerText}>
            This inspection report is valid for 30 days from the date of
            inspection. Recommendations are based on observations at the time of
            inspection. Vehicle condition may change based on usage and time.
            This report does not constitute a warranty or guarantee of vehicle
            condition.
          </Text>
          <View style={styles.footerMetaRow}>
            <Text style={styles.footerMeta}>
              &copy; {new Date().getFullYear()}{" "}
              {organization?.name ?? "All rights reserved."}
            </Text>
            <Text style={styles.footerMeta}>
              Generated {formatDate(new Date().toISOString())}
              {inspection.jobCode ? ` · Job ${inspection.jobCode}` : ""}
            </Text>
          </View>
        </View>
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

/** Renders nothing when the value is missing — no "Key —" placeholder rows. */
function InfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{String(value)}</Text>
    </View>
  );
}

function FindingRow({
  finding,
  index,
}: {
  finding: IInspectionFinding;
  index: number;
}) {
  const bucket = normalizeStatus(finding.status);
  return (
    <View style={styles.row} wrap={false}>
      <Text style={[styles.cellIndex, styles.colIndex]}>{index + 1}</Text>
      <Text style={[styles.cellComponent, styles.colComponent]}>
        {finding.component}
      </Text>
      <View style={[styles.cellStatus, styles.colStatus]}>
        <StatusIcon bucket={bucket} size={9} />
        <Text style={[styles.cellStatusText, { color: status[bucket] }]}>
          {prettyStatus(finding.status)}
        </Text>
      </View>
      <Text style={[styles.cellObservation, styles.colObservation]}>
        {finding.observation ?? ""}
      </Text>
    </View>
  );
}
