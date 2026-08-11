import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { REPORT_TITLE } from "../constants";
import { formatReportDate, vehicleLine } from "../utils/format";

const styles = StyleSheet.create({
  masthead: {
    backgroundColor: c.ink,
    paddingTop: px(26),
    paddingBottom: px(22),
    paddingHorizontal: px(34),
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: px(24),
  },
  brand: { flexDirection: "row", gap: px(14), alignItems: "center", flex: 1 },
  mark: {
    width: px(46),
    height: px(46),
    borderRadius: px(9),
    backgroundColor: c.markBg,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    fontWeight: 700,
    fontSize: px(17),
    color: c.accent,
    letterSpacing: -0.4,
  },
  logo: { maxWidth: px(36), maxHeight: px(36), objectFit: "contain" },
  orgName: {
    fontSize: px(20),
    fontWeight: 600,
    color: c.onInk,
    letterSpacing: -0.2,
  },
  orgTagline: { fontSize: px(12), color: c.onInkSoft, marginTop: px(2) },

  plate: {
    alignItems: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: c.onInkRule,
    paddingLeft: px(22),
  },
  plateLabel: {
    fontSize: px(9.5),
    letterSpacing: px(1.3),
    textTransform: "uppercase",
    color: c.onInkLabel,
  },
  plateValue: {
    fontSize: px(22),
    fontWeight: 700,
    color: c.onInk,
    letterSpacing: 0.5,
    marginTop: px(1),
  },

  metaRow: {
    flexDirection: "row",
    gap: px(18),
    marginTop: px(20),
    paddingTop: px(16),
    borderTopWidth: 1,
    borderTopColor: c.onInkRuleSoft,
  },
  metaCell: { flex: 1 },
  metaKey: {
    fontSize: px(9.5),
    letterSpacing: px(1.25),
    textTransform: "uppercase",
    color: c.onInkLabel,
  },
  metaValue: {
    fontSize: px(13),
    fontWeight: 600,
    color: c.onInk,
    marginTop: px(3),
  },
});

/** Renders nothing when the value is missing, so no empty cells appear. */
function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaKey}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export function Masthead({
  inspection,
  organization,
}: {
  inspection: IInspection;
  organization?: IOrganization;
}) {
  const registration = inspection.vehicleRegistrationNumber;

  return (
    <View style={styles.masthead}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            {organization?.logoUrl ? (
              <Image src={organization.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.markText}>
                {organization?.name?.[0] ?? "R"}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.orgName}>
              {organization?.name ?? "Vehicle Inspection"}
            </Text>
            <Text style={styles.orgTagline}>{REPORT_TITLE}</Text>
          </View>
        </View>

        {registration ? (
          <View style={styles.plate}>
            <Text style={styles.plateLabel}>Registration</Text>
            <Text style={styles.plateValue}>{registration}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Meta label="Vehicle" value={vehicleLine(inspection)} />
        <Meta
          label="Inspected"
          value={formatReportDate(inspection.inspectionDate)}
        />
        <Meta label="Report No." value={inspection.jobCode} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Owner" value={inspection.customerName} />
        <Meta label="Contact" value={inspection.customerPhone} />
        <Meta label="VIN / Chassis" value={inspection.vehicleVin} />
      </View>
    </View>
  );
}
