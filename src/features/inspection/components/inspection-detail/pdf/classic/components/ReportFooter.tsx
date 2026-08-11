import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { REPORT_DISCLAIMER } from "../constants";
import { formatReportDate, organizationContact } from "../utils/format";

const styles = StyleSheet.create({
  footer: {
    backgroundColor: c.navy,
    paddingVertical: px(24),
    paddingHorizontal: px(36),
    marginTop: px(8),
  },
  columns: { flexDirection: "row", gap: px(40), marginBottom: px(20) },
  column: { flex: 1 },
  label: {
    fontSize: px(9),
    fontWeight: 600,
    color: c.navyMuted,
    textTransform: "uppercase",
    letterSpacing: px(1),
    marginBottom: px(10),
  },
  line: { fontSize: px(10), color: c.navyText, marginBottom: px(5) },
  disclaimerWrap: {
    paddingTop: px(16),
    borderTopWidth: 1,
    borderTopColor: c.navyBorder,
  },
  disclaimer: {
    fontSize: px(8),
    color: c.navyMuted,
    lineHeight: 1.6,
    marginBottom: px(10),
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: px(8), color: c.navyMuted },
});

function Column({ label, lines }: { label: string; lines: string[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function ReportFooter({
  inspection,
  organization,
}: {
  inspection: IInspection;
  organization?: IOrganization;
}) {
  const { contactLines, addressLines } = organizationContact(organization);

  return (
    <View style={styles.footer} wrap={false}>
      <View style={styles.columns}>
        <Column label="Contact Us" lines={contactLines} />
        <Column label="Location" lines={addressLines} />
      </View>

      <View style={styles.disclaimerWrap}>
        <Text style={styles.disclaimer}>{REPORT_DISCLAIMER}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            &copy; {new Date().getFullYear()}{" "}
            {organization?.name ?? "All rights reserved."}
          </Text>
          <Text style={styles.meta}>
            Generated {formatReportDate(inspection.inspectionDate)}
            {inspection.jobCode ? ` · Job ${inspection.jobCode}` : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}
