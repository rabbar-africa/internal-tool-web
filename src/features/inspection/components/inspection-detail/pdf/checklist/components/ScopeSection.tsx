import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IInspectionChecklist } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { SCOPE_FOOTNOTE, SCOPE_HEADING } from "../constants";

const styles = StyleSheet.create({
  scope: {
    borderWidth: 1,
    borderColor: c.hair,
    paddingVertical: px(14),
    paddingHorizontal: px(16),
    marginBottom: px(24),
  },
  heading: {
    fontSize: px(11),
    letterSpacing: px(1.1),
    textTransform: "uppercase",
    color: c.inkSoft,
    marginBottom: px(8),
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "33.33%",
    flexDirection: "row",
    alignItems: "center",
    gap: px(6),
    paddingRight: px(16),
    marginBottom: px(5),
  },
  tick: { fontSize: px(11), fontWeight: 700, color: c.pass },
  dash: { fontSize: px(11), fontWeight: 700, color: c.muted },
  label: { fontSize: px(12), color: c.inkSoft, flex: 1 },
  footnote: {
    fontSize: px(11),
    color: c.muted,
    marginTop: px(10),
    lineHeight: 1.5,
  },
});

/**
 * What was actually inspected, from the checklist. Items never answered are
 * left out — claiming to have checked something nobody looked at would be a
 * lie in a customer-facing document.
 */
export function ScopeSection({
  checklists,
}: {
  checklists: IInspectionChecklist[];
}) {
  const answered = checklists.filter(
    (entry) => entry.status !== "NOT_APPLICABLE",
  );
  if (answered.length === 0) return null;

  return (
    <View style={styles.scope} wrap={false}>
      <Text style={styles.heading}>{SCOPE_HEADING}</Text>
      <View style={styles.grid}>
        {answered.map((entry) => {
          const isOk = entry.status === "OK";
          return (
            <View key={entry.id} style={styles.cell}>
              <Text style={isOk ? styles.tick : styles.dash}>
                {isOk ? "✓" : "–"}
              </Text>
              <Text style={styles.label}>
                {entry.checklistItem?.name}
                {isOk ? "" : " (see above)"}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.footnote}>{SCOPE_FOOTNOTE}</Text>
    </View>
  );
}
