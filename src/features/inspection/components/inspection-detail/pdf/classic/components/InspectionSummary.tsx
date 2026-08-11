import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { px } from "../colors";
import { STATUS_CONFIG } from "../constants";
import type { FindingGroup } from "../utils/findings";
import { sharedStyles } from "../styles";

const styles = StyleSheet.create({
  section: { paddingHorizontal: px(36), paddingBottom: px(24) },
  row: { flexDirection: "row", gap: px(12) },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: px(8),
    paddingVertical: px(16),
    paddingHorizontal: px(12),
    alignItems: "center",
  },
  label: {
    fontSize: px(12),
    textTransform: "uppercase",
    letterSpacing: px(0.8),
    marginBottom: px(8),
  },
  value: { fontSize: px(24), fontWeight: 600 },
  unit: { fontSize: px(12), marginTop: px(4) },
});

/** One tile per severity band, zeros included — an all-clear is worth stating. */
export function InspectionSummary({ groups }: { groups: FindingGroup[] }) {
  return (
    <View style={styles.section}>
      <Text style={sharedStyles.sectionHeading}>Inspection Summary</Text>
      <View style={styles.row}>
        {groups.map((group) => {
          const cfg = STATUS_CONFIG[group.bucket];
          return (
            <View
              key={group.bucket}
              style={[
                styles.card,
                { backgroundColor: cfg.bg, borderColor: cfg.border },
              ]}
            >
              <Text style={[styles.label, { color: cfg.text }]}>
                {group.label}
              </Text>
              <Text style={[styles.value, { color: cfg.text }]}>
                {group.count}
              </Text>
              <Text style={[styles.unit, { color: cfg.text }]}>
                {group.unit}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
