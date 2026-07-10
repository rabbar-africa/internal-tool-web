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
import { registerPdfFonts } from "@/features/invoices/components/invoice-detail/pdf/registerFonts";

registerPdfFonts();

// ─── Palette (mirrors the reference design tokens) ──────────────────────────
const c = {
  navy: "#1B2E48",
  navyText: "rgba(255,255,255,0.86)",
  navyMuted: "rgba(255,255,255,0.5)",
  navyBorder: "rgba(255,255,255,0.12)",
  sectionBg: "#FAFBFC",
  border: "#EDEFF2",
  textPrimary: "#3B424E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  passText: "#4F9D77",
  passBg: "rgba(79,157,119,0.09)",
  passBorder: "rgba(79,157,119,0.20)",
  warnText: "#B58A3C",
  warnBg: "rgba(181,138,60,0.09)",
  warnBorder: "rgba(181,138,60,0.20)",
  failText: "#C1665A",
  failBg: "rgba(193,102,90,0.09)",
  failBorder: "rgba(193,102,90,0.20)",
} as const;

type Bucket = "pass" | "warning" | "fail";

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

const normalizeStatus = (status?: string): Bucket =>
  STATUS_BUCKET[status?.toLowerCase?.() ?? ""] ?? "warning";

const prettyStatus = (status?: string) =>
  (status ?? "").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

const formatDate = (v?: string) => (v ? moment(v).format("DD MMM YYYY") : "—");

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

const STATUS_STYLE: Record<
  Bucket,
  { text: string; bg: string; border: string }
> = {
  pass: { text: c.passText, bg: c.passBg, border: c.passBorder },
  warning: { text: c.warnText, bg: c.warnBg, border: c.warnBorder },
  fail: { text: c.failText, bg: c.failBg, border: c.failBorder },
};

// ─── Status icons ────────────────────────────────────────────────────────────
function StatusIcon({ bucket }: { bucket: Bucket }) {
  const color = STATUS_STYLE[bucket].text;
  if (bucket === "pass") {
    return (
      <Svg width={11} height={11} viewBox="0 0 16 16">
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
      <Svg width={11} height={11} viewBox="0 0 16 16">
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
    <Svg width={11} height={11} viewBox="0 0 16 16">
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: 400,
    color: c.textSecondary,
    backgroundColor: c.white,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Header
  header: {
    backgroundColor: c.navy,
    paddingHorizontal: 36,
    paddingTop: 26,
    paddingBottom: 20,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 46, height: 46, borderRadius: 6, objectFit: "contain" },
  logoFallback: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: c.white, fontSize: 15, fontWeight: 600 },
  orgName: { fontSize: 14, fontWeight: 600, color: c.white, marginBottom: 2 },
  headerSub: { fontSize: 8.5, color: c.navyMuted },
  hLabel: {
    fontSize: 7,
    color: c.navyMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  hValue: { fontSize: 9.5, fontWeight: 500, color: c.navyText },
  hValueLg: { fontSize: 12, fontWeight: 500, color: c.navyText },
  headerBottom: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.navyBorder,
    flexDirection: "row",
    gap: 32,
  },

  // Generic section
  section: { paddingHorizontal: 36, paddingTop: 18 },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: 500,
    color: c.textPrimary,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },

  // Cards
  cardRow: { flexDirection: "row", gap: 14 },
  card: {
    flex: 1,
    backgroundColor: c.sectionBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    padding: 12,
  },
  subHeading: {
    fontSize: 8,
    fontWeight: 500,
    color: c.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3,
  },
  infoKey: { fontSize: 8.5, color: c.textSecondary },
  infoVal: {
    fontSize: 8.5,
    fontWeight: 500,
    color: c.textPrimary,
    textAlign: "right",
    maxWidth: "58%",
  },

  // Summary stat cards
  statRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: { fontSize: 19, fontWeight: 600, lineHeight: 1 },
  statSub: { fontSize: 7.5, marginTop: 3, opacity: 0.8 },

  // System checks
  checksCard: {
    backgroundColor: c.sectionBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    padding: 16,
  },
  checksHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  checksTitle: { fontSize: 11, fontWeight: 600, color: c.textPrimary },
  checksSub: { fontSize: 8, color: c.textMuted, marginTop: 1 },
  counts: { flexDirection: "row", gap: 14, alignItems: "center" },
  count: { flexDirection: "row", alignItems: "center", gap: 4 },
  countText: { fontSize: 9, fontWeight: 500 },
  grid: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  col: { flex: 1, flexDirection: "column", gap: 8 },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  checkBody: { flex: 1 },
  checkTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  checkComponent: { fontSize: 9, fontWeight: 500, color: c.textPrimary },
  badge: {
    fontSize: 6.5,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.2,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  checkObs: { fontSize: 8, color: c.textSecondary, lineHeight: 1.4 },

  // Notes
  notesBox: {
    backgroundColor: c.sectionBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    padding: 14,
  },
  notesText: { fontSize: 8.5, color: c.textPrimary, lineHeight: 1.6 },

  // Footer
  footer: {
    backgroundColor: c.navy,
    paddingHorizontal: 36,
    paddingVertical: 22,
    marginTop: 18,
  },
  footerCols: { flexDirection: "row", gap: 40, marginBottom: 18 },
  footerLabel: {
    fontSize: 7.5,
    color: c.navyMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    fontWeight: 500,
  },
  footerLine: { fontSize: 8.5, color: c.navyText, marginBottom: 4 },
  disclaimer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: c.navyBorder,
  },
  disclaimerText: {
    fontSize: 7,
    color: c.navyMuted,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  footerMeta: { fontSize: 7, color: c.navyMuted },
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

  // Two-column split for the checks grid.
  const left = findings.filter((_, i) => i % 2 === 0);
  const right = findings.filter((_, i) => i % 2 !== 0);

  const address = [
    organization?.addressLine1,
    organization?.city,
    organization?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Document title={`Inspection Report ${inspection.jobCode ?? ""}`.trim()}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.rowBetween}>
            <View style={styles.brand}>
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
                <Text style={styles.orgName}>
                  {organization?.name ?? "Vehicle Inspection"}
                </Text>
                <Text style={styles.headerSub}>
                  Full Vehicle Inspection &amp; Diagnostic Report
                </Text>
              </View>
            </View>
            {organization?.rcNumber ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.hLabel}>RC No.</Text>
                <Text style={styles.hValueLg}>{organization.rcNumber}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.headerBottom}>
            <View>
              <Text style={styles.hLabel}>Inspection Date</Text>
              <Text style={styles.hValue}>{formattedDate}</Text>
            </View>
            {inspection.jobCode ? (
              <View>
                <Text style={styles.hLabel}>Report #</Text>
                <Text style={styles.hValue}>{inspection.jobCode}</Text>
              </View>
            ) : null}
            {inspection.technicianName ? (
              <View>
                <Text style={styles.hLabel}>Technician</Text>
                <Text style={styles.hValue}>{inspection.technicianName}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Vehicle + Owner */}
        <View style={styles.section}>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.subHeading}>Vehicle Details</Text>
              <InfoLine label="Make / Model" value={fullVehicleName} />
              <InfoLine
                label="Reg. Number"
                value={inspection.vehicleRegistrationNumber}
              />
              <InfoLine label="Color" value={inspection.vehicleColor} />
              <InfoLine label="VIN" value={inspection.vehicleVin} />
            </View>
            <View style={styles.card}>
              <Text style={styles.subHeading}>Owner Information</Text>
              <InfoLine label="Name" value={inspection.customerName} />
              <InfoLine label="Phone" value={inspection.customerPhone} />
              <InfoLine label="Email" value={inspection.customerEmail} />
            </View>
          </View>
        </View>

        {/* Inspection Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Inspection Summary</Text>
          <View style={styles.statRow}>
            <StatCard
              label="Immediate Attention"
              value={failCount}
              sub={failCount === 1 ? "item" : "items"}
              bucket="fail"
            />
            <StatCard
              label="Monitor"
              value={warnCount}
              sub={warnCount === 1 ? "item" : "items"}
              bucket="warning"
            />
            <StatCard
              label="Passed"
              value={passCount}
              sub="checks"
              bucket="pass"
            />
          </View>
        </View>

        {/* System Checks */}
        <View style={[styles.section, { paddingBottom: 8 }]}>
          <View style={styles.checksCard}>
            <View style={styles.checksHead}>
              <View>
                <Text style={styles.checksTitle}>System Checks</Text>
                <Text style={styles.checksSub}>
                  Comprehensive vehicle system inspection
                </Text>
              </View>
              <View style={styles.counts}>
                <CountChip bucket="pass" count={passCount} />
                <CountChip bucket="warning" count={warnCount} />
                <CountChip bucket="fail" count={failCount} />
              </View>
            </View>

            {findings.length === 0 ? (
              <Text
                style={{
                  fontSize: 9,
                  color: c.textMuted,
                  textAlign: "center",
                  paddingVertical: 10,
                }}
              >
                No findings recorded.
              </Text>
            ) : (
              <View style={styles.grid}>
                <View style={styles.col}>
                  {left.map((f, i) => (
                    <CheckItem key={i} finding={f} />
                  ))}
                </View>
                <View style={styles.col}>
                  {right.map((f, i) => (
                    <CheckItem key={i} finding={f} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>
              Technician Notes &amp; Recommendations
            </Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} wrap={false}>
          <View style={styles.footerCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerLabel}>Contact Us</Text>
              {organization?.phone ? (
                <Text style={styles.footerLine}>{organization.phone}</Text>
              ) : null}
              {organization?.phone2 ? (
                <Text style={styles.footerLine}>{organization.phone2}</Text>
              ) : null}
              {organization?.companyEmail || organization?.email ? (
                <Text style={styles.footerLine}>
                  {organization?.companyEmail || organization?.email}
                </Text>
              ) : null}
              {organization?.website ? (
                <Text style={styles.footerLine}>{organization.website}</Text>
              ) : null}
            </View>
            {address ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.footerLabel}>Location</Text>
                {organization?.addressLine1 ? (
                  <Text style={styles.footerLine}>
                    {organization.addressLine1}
                  </Text>
                ) : null}
                {organization?.addressLine2 ? (
                  <Text style={styles.footerLine}>
                    {organization.addressLine2}
                  </Text>
                ) : null}
                {organization?.city || organization?.state ? (
                  <Text style={styles.footerLine}>
                    {[organization?.city, organization?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This inspection report is valid for 30 days from the date of
              inspection. Recommendations are based on observations at the time
              of inspection. Vehicle condition may change based on usage and
              time. This report does not constitute a warranty or guarantee of
              vehicle condition.
            </Text>
            <View style={styles.rowBetween}>
              <Text style={styles.footerMeta}>
                &copy; {new Date().getFullYear()}{" "}
                {organization?.name ?? "All rights reserved."}
              </Text>
              <Text style={styles.footerMeta}>
                Generated {formattedDate}
                {inspection.jobCode ? ` · Job ${inspection.jobCode}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const display =
    value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{display}</Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  bucket,
}: {
  label: string;
  value: number;
  sub: string;
  bucket: Bucket;
}) {
  const s = STATUS_STYLE[bucket];
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: s.bg, borderColor: s.border },
      ]}
    >
      <Text style={[styles.statLabel, { color: s.text }]}>{label}</Text>
      <Text style={[styles.statValue, { color: s.text }]}>{value}</Text>
      <Text style={[styles.statSub, { color: s.text }]}>{sub}</Text>
    </View>
  );
}

function CountChip({ bucket, count }: { bucket: Bucket; count: number }) {
  return (
    <View style={styles.count}>
      <StatusIcon bucket={bucket} />
      <Text style={[styles.countText, { color: STATUS_STYLE[bucket].text }]}>
        {count}
      </Text>
    </View>
  );
}

function CheckItem({ finding }: { finding: IInspectionFinding }) {
  const bucket = normalizeStatus(finding.status);
  const s = STATUS_STYLE[bucket];
  return (
    <View
      style={[
        styles.checkItem,
        { backgroundColor: s.bg, borderColor: s.border },
      ]}
      wrap={false}
    >
      <View style={{ marginTop: 1 }}>
        <StatusIcon bucket={bucket} />
      </View>
      <View style={styles.checkBody}>
        <View style={styles.checkTop}>
          <Text style={styles.checkComponent}>{finding.component}</Text>
          <Text
            style={[
              styles.badge,
              { color: s.text, backgroundColor: s.bg, borderColor: s.border },
            ]}
          >
            {prettyStatus(finding.status)}
          </Text>
        </View>
        {finding.observation ? (
          <Text style={styles.checkObs}>{finding.observation}</Text>
        ) : null}
      </View>
    </View>
  );
}
