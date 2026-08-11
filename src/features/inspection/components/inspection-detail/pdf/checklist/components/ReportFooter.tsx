import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { FINE_PRINT } from "../constants";
import { organizationContact } from "../utils/format";

// The navy band the classic report closes on, carrying the sheet's columns.
const styles = StyleSheet.create({
  footer: {
    backgroundColor: c.ink,
    paddingTop: px(20),
    paddingBottom: px(22),
    paddingHorizontal: px(34),
    marginTop: px(8),
  },
  columns: { flexDirection: "row", gap: px(20), marginBottom: px(12) },
  column: { flex: 1 },
  key: {
    fontSize: px(9.5),
    letterSpacing: px(1.15),
    textTransform: "uppercase",
    color: c.onInkLabel,
    marginBottom: px(4),
  },
  line: { fontSize: px(12), color: c.onInk, lineHeight: 1.6 },
  fine: {
    borderTopWidth: 1,
    borderTopColor: c.onInkRule,
    paddingTop: px(11),
    fontSize: px(11),
    color: c.onInkSoft,
    lineHeight: 1.55,
  },
});

function Column({ label, lines }: { label: string; lines: string[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.column}>
      <Text style={styles.key}>{label}</Text>
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
  const { workshopLines, contactLines, companyLines } =
    organizationContact(organization);

  return (
    <View style={styles.footer} wrap={false}>
      <View style={styles.columns}>
        <Column label="Workshop" lines={workshopLines} />
        <Column label="Contact" lines={contactLines} />
        <Column label="Company" lines={companyLines} />
      </View>

      <Text style={styles.fine}>
        {FINE_PRINT} · &copy; {new Date().getFullYear()}{" "}
        {organization?.name ?? "All rights reserved."}
        {inspection.jobCode ? ` · Job ${inspection.jobCode}` : ""}
      </Text>
    </View>
  );
}
