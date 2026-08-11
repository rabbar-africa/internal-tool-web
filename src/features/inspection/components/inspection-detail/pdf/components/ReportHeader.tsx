import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { REPORT_SUBTITLE } from "../constants";
import { formatReportDate } from "../utils/format";

const styles = StyleSheet.create({
  header: {
    backgroundColor: c.navy,
    paddingVertical: px(28),
    paddingHorizontal: px(36),
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: px(14),
    flex: 1,
  },
  logo: {
    width: px(64),
    height: px(64),
    borderRadius: px(8),
    objectFit: "contain",
  },
  orgName: {
    fontSize: px(24),
    fontWeight: 700,
    color: c.navyText,
    marginBottom: px(3),
    letterSpacing: -0.2,
  },
  orgTagline: { fontSize: px(14), color: c.navyText },
  label: {
    fontSize: px(12),
    color: c.navyMuted,
    textTransform: "uppercase",
    letterSpacing: px(1),
    marginBottom: px(3),
  },
  value: { fontSize: px(14), fontWeight: 600, color: c.navyText },
  valueLarge: { fontSize: px(18), fontWeight: 600, color: c.navyText },
  meta: {
    marginTop: px(20),
    paddingTop: px(16),
    borderTopWidth: 1,
    borderTopColor: c.navyBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: px(32),
  },
  alignCenter: { alignItems: "center" },
  alignEnd: { alignItems: "flex-end" },
});

/** A labelled value in the header's meta strip. Renders nothing when unset. */
function MetaField({
  label,
  value,
  align,
}: {
  label: string;
  value?: string;
  align?: "center" | "end";
}) {
  if (!value) return null;
  const alignment =
    align === "center"
      ? styles.alignCenter
      : align === "end"
        ? styles.alignEnd
        : undefined;
  return (
    <View style={alignment}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ReportHeader({
  inspection,
  organization,
}: {
  inspection: IInspection;
  organization?: IOrganization;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          {organization?.logoUrl ? (
            <Image src={organization.logoUrl} style={styles.logo} />
          ) : null}
          <View>
            <Text style={styles.orgName}>
              {organization?.name ?? "Vehicle Inspection"}
            </Text>
            <Text style={styles.orgTagline}>{REPORT_SUBTITLE}</Text>
          </View>
        </View>

        {organization?.rcNumber ? (
          <View style={styles.alignEnd}>
            <Text style={styles.label}>RC No.</Text>
            <Text style={styles.valueLarge}>{organization.rcNumber}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.meta}>
        <MetaField
          label="Inspection Date"
          value={formatReportDate(inspection.inspectionDate)}
        />
        <MetaField
          label="Technician"
          value={inspection.technicianName}
          align="center"
        />
        <MetaField label="Report #" value={inspection.jobCode} align="end" />
      </View>
    </View>
  );
}
