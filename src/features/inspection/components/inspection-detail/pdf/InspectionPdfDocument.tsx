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

const REPORT_SUBTITLE = "Full Vehicle Inspection & Diagnostic Report";

// Status palette — reserved semantic colors (print-friendly, from the theme).
// Every status is always rendered as icon + label, never color alone.
const status = {
  pass: "#2E7D43",
  warning: "#B58A3C",
  fail: "#C62828",
} as const;

type Bucket = keyof typeof status;

/** Card fills per status: `tile` for the summary, `soft` for finding cards. */
const tint: Record<Bucket, { tile: string; soft: string; border: string }> = {
  pass: { tile: "#EAF7EE", soft: "#F1F9F4", border: "#CBE9D5" },
  warning: { tile: "#FEF6E7", soft: "#FDF7EC", border: "#F1E0BC" },
  fail: { tile: "#FDECEC", soft: "#FDF2F2", border: "#F5D6D6" },
};

// Ink used on the navy header/footer bands.
const onNavy = {
  strong: c.white,
  soft: "#B9C4D2",
  muted: "#8A99AD",
  rule: "#26374F",
  tile: "#0C2A4D",
};

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

const prettyStatus = (s?: string) => (s ?? "").replace(/_/g, " ").toUpperCase();

const formatDate = (v?: string) => (v ? moment(v).format("DD MMM YYYY") : "");

// ─── Notes ───────────────────────────────────────────────────────────────────
// The notes arrive as rich text (hand-written or AI-generated) and react-pdf
// can't render HTML, so it's parsed into blocks that keep the structure that
// carries meaning: headings, list items and bold runs.

interface Segment {
  text: string;
  bold?: boolean;
}

interface NoteBlock {
  kind: "heading" | "paragraph" | "bullet" | "number";
  segments: Segment[];
  marker?: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  bull: "•",
  deg: "°",
  copy: "©",
  reg: "®",
  trade: "™",
};

const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] !== "#") return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    const code =
      body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });

/** Collapse whitespace and trim the block's outer edges, keeping bold runs. */
function tidy(segments: Segment[]): Segment[] {
  const out = segments
    .map((s) => ({ ...s, text: s.text.replace(/\s+/g, " ") }))
    .filter((s) => s.text !== "");
  if (out.length) {
    out[0] = { ...out[0], text: out[0].text.replace(/^\s+/, "") };
    const last = out.length - 1;
    out[last] = { ...out[last], text: out[last].text.replace(/\s+$/, "") };
  }
  return out.filter((s) => s.text !== "");
}

/** Notes typed as plain text still get their bullets and numbering honoured. */
function parsePlainNotes(text: string): NoteBlock[] {
  return decodeEntities(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): NoteBlock => {
      const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (numbered) {
        return {
          kind: "number",
          marker: `${numbered[1]}.`,
          segments: [{ text: numbered[2] }],
        };
      }
      const bulleted = line.match(/^[•\-*]\s+(.*)$/);
      if (bulleted) {
        return {
          kind: "bullet",
          marker: "•",
          segments: [{ text: bulleted[1] }],
        };
      }
      return { kind: "paragraph", segments: [{ text: line }] };
    });
}

function parseNotes(html?: string): NoteBlock[] {
  if (!html?.trim()) return [];
  if (!/<[a-z][^>]*>/i.test(html)) return parsePlainNotes(html);

  const blocks: NoteBlock[] = [];
  const lists: { ordered: boolean; count: number }[] = [];
  let segments: Segment[] = [];
  let kind: NoteBlock["kind"] = "paragraph";
  let marker: string | undefined;
  let bold = 0;

  const flush = () => {
    const tidied = tidy(segments);
    if (tidied.length) blocks.push({ kind, segments: tidied, marker });
    segments = [];
    kind = "paragraph";
    marker = undefined;
  };

  const tagPattern = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html))) {
    const chunk = html.slice(cursor, match.index);
    if (chunk) segments.push({ text: decodeEntities(chunk), bold: bold > 0 });
    cursor = tagPattern.lastIndex;

    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();

    switch (tag) {
      case "strong":
      case "b":
        bold = closing ? Math.max(0, bold - 1) : bold + 1;
        break;
      case "ul":
      case "ol":
        flush();
        if (closing) lists.pop();
        else lists.push({ ordered: tag === "ol", count: 0 });
        break;
      case "li": {
        flush();
        if (closing) break;
        const list = lists[lists.length - 1];
        if (list?.ordered) {
          list.count += 1;
          kind = "number";
          marker = `${list.count}.`;
        } else {
          kind = "bullet";
          marker = "•";
        }
        break;
      }
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        flush();
        if (!closing) kind = "heading";
        break;
      case "p":
      case "div":
      case "br":
      case "tr":
        flush();
        break;
      default:
        break; // inline tags (span, em, a…) keep their text in the current block
    }
  }

  const tail = html.slice(cursor);
  if (tail) segments.push({ text: decodeEntities(tail), bold: bold > 0 });
  flush();

  return blocks;
}

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

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Poppins",
    fontWeight: 400,
    color: c.gray400,
    backgroundColor: c.white,
  },

  // ── Navy header band ──
  header: {
    backgroundColor: c.primary500,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoTile: {
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: onNavy.tile,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  logo: { maxWidth: 30, maxHeight: 30, objectFit: "contain" },
  logoFallbackText: { color: c.white, fontSize: 15, fontWeight: 700 },
  brandName: { fontSize: 17, fontWeight: 700, color: onNavy.strong },
  brandTagline: { fontSize: 8.5, color: onNavy.soft, marginTop: 1 },

  headerLabel: {
    fontSize: 6.5,
    fontWeight: 500,
    color: onNavy.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  headerValue: {
    fontSize: 10,
    fontWeight: 600,
    color: onNavy.strong,
    marginTop: 3,
  },
  headerValueLarge: {
    fontSize: 15,
    fontWeight: 700,
    color: onNavy.strong,
    marginTop: 2,
  },
  headerRule: {
    borderBottomWidth: 1,
    borderBottomColor: onNavy.rule,
    marginTop: 16,
    marginBottom: 12,
  },
  headerMetaRow: { flexDirection: "row", justifyContent: "space-between" },

  // ── Body ──
  body: { paddingHorizontal: 22, paddingTop: 20 },

  sectionTitle: { fontSize: 12, fontWeight: 600, color: c.gray500 },
  sectionRule: {
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
    marginTop: 7,
    marginBottom: 12,
  },

  // Vehicle / Owner cards
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  infoCard: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  infoTitle: {
    fontSize: 7.5,
    fontWeight: 500,
    color: "#98A2B3",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2.5,
  },
  infoKey: { fontSize: 8.5, color: "#667085" },
  infoVal: {
    fontSize: 8.5,
    fontWeight: 500,
    color: c.gray500,
    textAlign: "right",
    maxWidth: "60%",
  },

  // Summary tiles
  statRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 7,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    textAlign: "center",
  },
  statValue: { fontSize: 19, fontWeight: 700, marginTop: 4 },
  statSub: { fontSize: 7, color: "#98A2B3", marginTop: 1 },

  // System checks
  checksCard: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 5,
    padding: 12,
  },
  checksHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  checksTitle: { fontSize: 11, fontWeight: 600, color: c.gray500 },
  checksSub: { fontSize: 7.5, color: "#98A2B3", marginTop: 1 },
  counts: { flexDirection: "row", gap: 10, alignItems: "center" },
  count: { flexDirection: "row", alignItems: "center", gap: 3 },
  countText: { fontSize: 8.5, fontWeight: 600 },
  checksRule: {
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    marginTop: 10,
    marginBottom: 10,
  },

  findingRow: { flexDirection: "row", gap: 9, alignItems: "flex-start" },
  findingCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 9,
  },
  findingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
  },
  findingNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  findingName: { fontSize: 9, fontWeight: 600, color: c.gray500, flex: 1 },
  pill: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: c.white,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  pillText: { fontSize: 5.5, fontWeight: 600, letterSpacing: 0.4 },
  findingObs: {
    fontSize: 8,
    color: "#667085",
    lineHeight: 1.45,
    marginTop: 4,
    marginLeft: 14,
  },
  emptyChecks: {
    fontSize: 9,
    color: "#98A2B3",
    textAlign: "center",
    paddingVertical: 14,
  },

  // Notes
  section: { marginTop: 20 },
  notesCard: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 5,
    backgroundColor: "#FAFBFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteHeading: {
    fontSize: 9.5,
    fontWeight: 600,
    color: c.gray500,
    marginTop: 9,
    marginBottom: 4,
  },
  noteParagraph: { marginBottom: 4 },
  noteText: { fontSize: 8.5, color: "#475467", lineHeight: 1.5 },
  noteListItem: { flexDirection: "row", marginBottom: 3, paddingLeft: 6 },
  noteMarker: {
    fontSize: 8.5,
    color: "#667085",
    width: 13,
    lineHeight: 1.5,
  },
  noteBold: { fontWeight: 600, color: c.gray500 },

  // ── Navy footer band ──
  footer: {
    backgroundColor: c.primary500,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    marginTop: 22,
  },
  footerCols: { flexDirection: "row", gap: 24 },
  footerCol: { flex: 1 },
  footerLabel: {
    fontSize: 6.5,
    fontWeight: 500,
    color: onNavy.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  footerLine: { fontSize: 8, color: onNavy.soft, marginBottom: 2 },
  footerRule: {
    borderBottomWidth: 1,
    borderBottomColor: onNavy.rule,
    marginTop: 13,
    marginBottom: 10,
  },
  footerDisclaimer: { fontSize: 6.5, color: onNavy.muted, lineHeight: 1.55 },
  footerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerMeta: { fontSize: 6.5, color: onNavy.muted },
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
  const countOf = (bucket: Bucket) =>
    findings.filter((f) => normalizeStatus(f.status) === bucket).length;
  const passCount = countOf("pass");
  const warnCount = countOf("warning");
  const failCount = countOf("fail");

  const vehicleName = [inspection.vehicleMake, inspection.vehicleModel]
    .filter(Boolean)
    .join(" ");
  const fullVehicleName = inspection.vehicleYear
    ? `${inspection.vehicleYear} ${vehicleName}`.trim()
    : vehicleName;

  const noteBlocks = parseNotes(inspection.generalNotes);
  const formattedDate = formatDate(inspection.inspectionDate);

  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.state]
    .filter(Boolean)
    .join(", ");
  // The formatted address usually already ends with the city/state.
  const showLocationLine =
    Boolean(orgLocation) &&
    !orgAddress.toLowerCase().includes(orgLocation.toLowerCase());
  const orgEmail = organization?.companyEmail || organization?.email;

  const statCards: {
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
  // Chips read best-to-worst, mirroring the tiles above them.
  const countChips = [...statCards].reverse().filter((s) => s.value > 0);

  // Two per row, so a row breaks across pages as a unit.
  const findingRows: IInspectionFinding[][] = [];
  for (let i = 0; i < findings.length; i += 2) {
    findingRows.push(findings.slice(i, i + 2));
  }

  return (
    <Document title={`Inspection Report ${inspection.jobCode ?? ""}`.trim()}>
      <Page size="A4" style={styles.page}>
        {/* ── Header band ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <View style={styles.logoTile}>
                {organization?.logoUrl ? (
                  <Image src={organization.logoUrl} style={styles.logo} />
                ) : (
                  <Text style={styles.logoFallbackText}>
                    {organization?.name?.[0] ?? "R"}
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.brandName}>{organization?.name ?? ""}</Text>
                <Text style={styles.brandTagline}>{REPORT_SUBTITLE}</Text>
              </View>
            </View>

            {organization?.rcNumber ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.headerLabel}>RC No.</Text>
                <Text style={styles.headerValueLarge}>
                  {organization.rcNumber}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.headerRule} />

          <View style={styles.headerMetaRow}>
            {formattedDate ? (
              <View>
                <Text style={styles.headerLabel}>Inspection Date</Text>
                <Text style={styles.headerValue}>{formattedDate}</Text>
              </View>
            ) : null}
            {inspection.technicianName ? (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.headerLabel}>Technician</Text>
                <Text style={styles.headerValue}>
                  {inspection.technicianName}
                </Text>
              </View>
            ) : null}
            {inspection.jobCode ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.headerLabel}>Report #</Text>
                <Text style={styles.headerValue}>{inspection.jobCode}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Vehicle + Owner ── */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Vehicle Details</Text>
              <InfoLine label="Make / Model" value={fullVehicleName} />
              <InfoLine
                label="Reg. Number"
                value={inspection.vehicleRegistrationNumber}
              />
              <InfoLine label="Color" value={inspection.vehicleColor} />
              <InfoLine label="VIN" value={inspection.vehicleVin} />
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Owner Information</Text>
              <InfoLine label="Name" value={inspection.customerName} />
              <InfoLine label="Phone" value={inspection.customerPhone} />
              <InfoLine label="Email" value={inspection.customerEmail} />
            </View>
          </View>

          {/* ── Summary ── */}
          <Text style={styles.sectionTitle}>Inspection Summary</Text>
          <View style={styles.sectionRule} />

          <View style={styles.statRow}>
            {statCards.map((s) => (
              <View
                key={s.bucket}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: tint[s.bucket].tile,
                    borderColor: tint[s.bucket].border,
                  },
                ]}
              >
                <Text style={[styles.statLabel, { color: status[s.bucket] }]}>
                  {s.label}
                </Text>
                <Text style={[styles.statValue, { color: status[s.bucket] }]}>
                  {s.value}
                </Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>

          {/* ── System checks ── */}
          <View style={styles.checksCard}>
            <View style={styles.checksHead}>
              <View>
                <Text style={styles.checksTitle}>System Checks</Text>
                <Text style={styles.checksSub}>
                  Comprehensive vehicle system inspection
                </Text>
              </View>
              <View style={styles.counts}>
                {countChips.map((s) => (
                  <View key={s.bucket} style={styles.count}>
                    <StatusIcon bucket={s.bucket} size={9} />
                    <Text
                      style={[styles.countText, { color: status[s.bucket] }]}
                    >
                      {s.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.checksRule} />

            {findings.length === 0 ? (
              <Text style={styles.emptyChecks}>No findings recorded.</Text>
            ) : (
              findingRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.findingRow} wrap={false}>
                  {row.map((finding, i) => (
                    <FindingCard key={i} finding={finding} />
                  ))}
                  {/* Keep a lone card to half-width on an odd count. */}
                  {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
                </View>
              ))
            )}
          </View>

          {/* ── Notes ── */}
          {noteBlocks.length ? (
            <View style={styles.section}>
              {/* Keep the heading with the notes it introduces. */}
              <View minPresenceAhead={90}>
                <Text style={styles.sectionTitle}>
                  Technician Notes &amp; Recommendations
                </Text>
                <View style={styles.sectionRule} />
              </View>
              <View style={styles.notesCard}>
                {noteBlocks.map((block, i) => (
                  <NoteBlockView key={i} block={block} isFirst={i === 0} />
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* ── Footer band ── */}
        <View style={styles.footer} wrap={false}>
          <View style={styles.footerCols}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Contact Us</Text>
              {organization?.phone ? (
                <Text style={styles.footerLine}>{organization.phone}</Text>
              ) : null}
              {orgEmail ? (
                <Text style={styles.footerLine}>{orgEmail}</Text>
              ) : null}
              {organization?.website ? (
                <Text style={styles.footerLine}>{organization.website}</Text>
              ) : null}
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Location</Text>
              {orgAddress ? (
                <Text style={styles.footerLine}>{orgAddress}</Text>
              ) : null}
              {showLocationLine ? (
                <Text style={styles.footerLine}>{orgLocation}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.footerRule} />

          <Text style={styles.footerDisclaimer}>
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

function FindingCard({ finding }: { finding: IInspectionFinding }) {
  const bucket = normalizeStatus(finding.status);
  return (
    <View
      style={[
        styles.findingCard,
        {
          backgroundColor: tint[bucket].soft,
          borderColor: tint[bucket].border,
        },
      ]}
    >
      <View style={styles.findingTop}>
        <View style={styles.findingNameRow}>
          <StatusIcon bucket={bucket} size={9} />
          <Text style={styles.findingName}>{finding.component}</Text>
        </View>
        {finding.status ? (
          <View style={[styles.pill, { borderColor: tint[bucket].border }]}>
            <Text style={[styles.pillText, { color: status[bucket] }]}>
              {prettyStatus(finding.status)}
            </Text>
          </View>
        ) : null}
      </View>
      {finding.observation ? (
        <Text style={styles.findingObs}>{finding.observation}</Text>
      ) : null}
    </View>
  );
}

function Segments({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (
        <Text key={i} style={s.bold ? styles.noteBold : undefined}>
          {s.text}
        </Text>
      ))}
    </>
  );
}

function NoteBlockView({
  block,
  isFirst,
}: {
  block: NoteBlock;
  isFirst: boolean;
}) {
  if (block.kind === "heading") {
    return (
      <Text style={[styles.noteHeading, isFirst ? { marginTop: 0 } : {}]}>
        <Segments segments={block.segments} />
      </Text>
    );
  }
  if (block.kind === "bullet" || block.kind === "number") {
    return (
      <View style={styles.noteListItem}>
        <Text style={styles.noteMarker}>{block.marker}</Text>
        <Text style={[styles.noteText, { flex: 1 }]}>
          <Segments segments={block.segments} />
        </Text>
      </View>
    );
  }
  return (
    <Text style={[styles.noteText, styles.noteParagraph]}>
      <Segments segments={block.segments} />
    </Text>
  );
}
