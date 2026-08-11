import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IInspection } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { vehicleTitle } from "../utils/format";

const styles = StyleSheet.create({
  section: { paddingVertical: px(18), paddingHorizontal: px(36) },
  row: { flexDirection: "row", gap: px(20) },
  card: {
    flex: 1,
    backgroundColor: c.sectionBg,
    borderRadius: px(8),
    padding: px(14),
    borderWidth: 1,
    borderColor: c.border,
  },
  heading: {
    fontSize: px(14),
    fontWeight: 600,
    color: c.textMuted,
    textTransform: "uppercase",
    letterSpacing: px(0.8),
    marginBottom: px(10),
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: px(4),
  },
  label: { fontSize: px(14), color: c.textSecondary },
  value: {
    fontSize: px(10),
    fontWeight: 500,
    color: c.textPrimary,
    textAlign: "right",
    maxWidth: "55%",
  },
});

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
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

export function VehicleInfo({ inspection }: { inspection: IInspection }) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.heading}>Vehicle Details</Text>
          <InfoLine label="Make / Model" value={vehicleTitle(inspection)} />
          <InfoLine
            label="Reg. Number"
            value={inspection.vehicleRegistrationNumber}
          />
          <InfoLine label="Color" value={inspection.vehicleColor} />
          {/* <InfoLine label="VIN" value={inspection.vehicleVin} /> */}
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Owner Information</Text>
          <InfoLine label="Name" value={inspection.customerName} />
          <InfoLine label="Phone" value={inspection.customerPhone} />
          <InfoLine label="Email" value={inspection.customerEmail} />
        </View>
      </View>
    </View>
  );
}
