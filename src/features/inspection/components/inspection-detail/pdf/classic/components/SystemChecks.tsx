import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { IInspectionFinding } from "@/shared/interface/inspection";
import { inspectionColors as c, px } from "../colors";
import { CHECKS_SUBTITLE, STATUS_CONFIG, type Bucket } from "../constants";
import { normalizeStatus, type FindingGroup } from "../utils/findings";
import { StatusIcon } from "./StatusIcon";

const styles = StyleSheet.create({
  section: { marginHorizontal: px(36), marginBottom: px(24) },
  card: {
    backgroundColor: c.sectionBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: px(10),
    padding: px(20),
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: px(14),
    marginBottom: px(16),
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  title: {
    fontSize: px(15),
    fontWeight: 700,
    color: c.textPrimary,
    marginBottom: px(2),
  },
  subtitle: { fontSize: px(10), color: c.textMuted },
  counts: { flexDirection: "row", gap: px(16), alignItems: "center" },
  count: { flexDirection: "row", alignItems: "center", gap: px(4) },
  countText: { fontSize: px(12), fontWeight: 600 },

  band: { marginTop: px(18) },
  bandHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: px(8),
  },
  bandLabel: {
    fontSize: px(11),
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: px(0.8),
  },
  bandCount: { fontSize: px(10), color: c.textMuted },

  // No alignItems, so the pair in a row stretches to a shared height — a card
  // carrying an observation no longer towers over the bare one beside it.
  row: { flexDirection: "row", gap: px(10) },
  rowGap: { marginBottom: px(8) },
  spacer: { flex: 1 },

  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: px(10),
    borderWidth: 1,
    borderRadius: px(8),
    paddingVertical: px(10),
    paddingHorizontal: px(12),
  },
  itemBody: { flex: 1 },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: px(3),
    gap: px(6),
  },
  component: {
    fontSize: px(11),
    fontWeight: 600,
    color: c.textPrimary,
    flex: 1,
  },
  pill: {
    borderWidth: 1,
    borderRadius: px(10),
    paddingVertical: px(2),
    paddingHorizontal: px(7),
  },
  pillText: { fontSize: px(8), fontWeight: 700, textTransform: "uppercase" },
  observation: { fontSize: px(12), color: c.textSecondary, lineHeight: 1.4 },
  empty: {
    fontSize: px(12),
    color: c.textMuted,
    textAlign: "center",
    paddingVertical: px(16),
  },
});

function CountChip({ bucket, count }: { bucket: Bucket; count: number }) {
  return (
    <View style={styles.count}>
      <StatusIcon bucket={bucket} />
      <Text style={[styles.countText, { color: STATUS_CONFIG[bucket].text }]}>
        {count}
      </Text>
    </View>
  );
}

function CheckItem({ finding }: { finding: IInspectionFinding }) {
  const cfg = STATUS_CONFIG[normalizeStatus(finding.status)];
  return (
    <View
      style={[
        styles.item,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
      ]}
    >
      <StatusIcon bucket={normalizeStatus(finding.status)} />
      <View style={styles.itemBody}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.component}>{finding.component}</Text>
          {finding.status ? (
            <View style={[styles.pill, { borderColor: cfg.border }]}>
              <Text style={[styles.pillText, { color: cfg.text }]}>
                {finding.status}
              </Text>
            </View>
          ) : null}
        </View>
        {finding.observation ? (
          <Text style={styles.observation}>{finding.observation}</Text>
        ) : null}
      </View>
    </View>
  );
}

/** One severity band: a labelled heading followed by its findings, two a row. */
function SeverityBand({
  group,
  isFirst,
}: {
  group: FindingGroup;
  isFirst: boolean;
}) {
  return (
    <View style={isFirst ? undefined : styles.band}>
      {/* Keeps the label from stranding itself at the foot of a page. */}
      <View style={styles.bandHead} minPresenceAhead={px(60)}>
        <Text
          style={[
            styles.bandLabel,
            { color: STATUS_CONFIG[group.bucket].text },
          ]}
        >
          {group.label}
        </Text>
        <Text style={styles.bandCount}>
          {group.count} {group.unit}
        </Text>
      </View>

      {group.rows.map((row, i) => (
        <View
          key={i}
          style={[styles.row, i < group.rows.length - 1 ? styles.rowGap : {}]}
          wrap={false}
        >
          {row.map((finding, j) => (
            <CheckItem key={j} finding={finding} />
          ))}
          {/* Keeps a lone card at half width on an odd count. */}
          {row.length === 1 ? <View style={styles.spacer} /> : null}
        </View>
      ))}
    </View>
  );
}

export function SystemChecks({ groups }: { groups: FindingGroup[] }) {
  const populated = groups.filter((group) => group.count > 0);

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.head}>
          <View>
            <Text style={styles.title}>System Checks</Text>
            <Text style={styles.subtitle}>{CHECKS_SUBTITLE}</Text>
          </View>
          <View style={styles.counts}>
            {[...groups].reverse().map((group) => (
              <CountChip
                key={group.bucket}
                bucket={group.bucket}
                count={group.count}
              />
            ))}
          </View>
        </View>

        {populated.length === 0 ? (
          <Text style={styles.empty}>No findings recorded.</Text>
        ) : (
          populated.map((group, i) => (
            <SeverityBand key={group.bucket} group={group} isFirst={i === 0} />
          ))
        )}
      </View>
    </View>
  );
}
