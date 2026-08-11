import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IAdvisory } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { BANDS, TALLY } from "../constants";
import { countIn, type Band } from "../utils/findings";

const styles = StyleSheet.create({
  verdict: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.hair,
  },
  lead: {
    flex: 1,
    paddingVertical: px(20),
    paddingHorizontal: px(34),
    borderRightWidth: 1,
    borderRightColor: c.hair,
  },
  eyebrow: {
    fontSize: px(9.5),
    letterSpacing: px(1.3),
    textTransform: "uppercase",
    color: c.muted,
  },
  headline: {
    fontSize: px(17),
    fontWeight: 600,
    color: c.ink,
    marginTop: px(6),
    marginBottom: px(4),
    letterSpacing: -0.2,
  },
  summary: { fontSize: px(12.5), color: c.inkSoft, lineHeight: 1.5 },

  tally: { flexDirection: "row" },
  cell: {
    paddingVertical: px(20),
    paddingHorizontal: px(22),
    alignItems: "center",
    minWidth: px(104),
    borderRightWidth: 1,
    borderRightColor: c.hair,
  },
  lastCell: { borderRightWidth: 0 },
  number: { fontSize: px(26), fontWeight: 700 },
  label: {
    fontSize: px(9.5),
    letterSpacing: px(0.95),
    textTransform: "uppercase",
    color: c.inkSoft,
    marginTop: px(7),
  },
});

/**
 * The advisory verdict beside a tally of what needs doing. Without an advisory
 * the headline falls back to a plain count so the bar still says something.
 */
export function VerdictBar({
  advisory,
  bands,
}: {
  advisory?: IAdvisory | null;
  bands: Band[];
}) {
  const fixNow = countIn(bands, "fix_now");
  const dueSoon = countIn(bands, "due_soon");

  const fallbackHeadline =
    fixNow > 0
      ? "Items need attention before this car is road-safe"
      : dueSoon > 0
        ? "Roadworthy, with work due soon"
        : "No outstanding work found";

  return (
    <View style={styles.verdict} wrap={false}>
      <View style={styles.lead}>
        <Text style={styles.eyebrow}>Overall</Text>
        <Text style={styles.headline}>
          {advisory?.verdict?.headline || fallbackHeadline}
        </Text>
        {advisory?.verdict?.summary ? (
          <Text style={styles.summary}>{advisory.verdict.summary}</Text>
        ) : null}
      </View>

      <View style={styles.tally}>
        {TALLY.map((cell, i) => (
          <View
            key={cell.key}
            style={[styles.cell, i === TALLY.length - 1 ? styles.lastCell : {}]}
          >
            <Text style={[styles.number, { color: BANDS[cell.key].color }]}>
              {cell.counts.reduce((sum, key) => sum + countIn(bands, key), 0)}
            </Text>
            <Text style={styles.label}>{cell.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
