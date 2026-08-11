import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { inspectionColors as c, px } from "../colors";
import { BANDS, type BandKey } from "../constants";
import {
  itemCount,
  timingFor,
  type Band,
  type BandItem,
} from "../utils/findings";

const styles = StyleSheet.create({
  band: { marginBottom: px(26) },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: px(10),
    paddingBottom: px(7),
    marginBottom: px(12),
    borderBottomWidth: 2,
  },
  title: {
    fontSize: px(12),
    fontWeight: 700,
    letterSpacing: px(1.1),
    textTransform: "uppercase",
  },
  when: { fontSize: px(11.5), fontWeight: 500, color: c.inkSoft },
  count: { fontSize: px(11), color: c.muted, marginLeft: "auto" },

  row: {
    flexDirection: "row",
    gap: px(18),
    borderWidth: 1,
    borderColor: c.hair,
    borderLeftWidth: 3,
    paddingVertical: px(12),
    paddingHorizontal: px(14),
    marginBottom: px(8),
  },
  main: { flex: 1 },
  itemTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: px(7),
    marginBottom: px(3),
  },
  icon: {
    width: px(15),
    height: px(15),
    borderRadius: px(7.5),
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: px(9),
    fontWeight: 700,
    color: c.paper,
    lineHeight: 1,
  },
  itemTitleText: {
    fontSize: px(13.5),
    fontWeight: 600,
    color: c.ink,
    flex: 1,
  },
  observation: { fontSize: px(12.5), color: c.inkSoft, lineHeight: 1.5 },
  risk: {
    fontSize: px(12),
    color: c.ink,
    lineHeight: 1.5,
    marginTop: px(6),
    paddingLeft: px(9),
    borderLeftWidth: 2,
    borderLeftColor: c.riskRule,
  },
  riskLabel: { fontWeight: 600 },

  photos: { flexDirection: "row", gap: px(7), marginTop: px(9) },
  photo: {
    width: px(52),
    height: px(40),
    borderRadius: px(3),
    objectFit: "cover",
  },

  timing: {
    width: px(112),
    alignItems: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: c.hair,
    paddingLeft: px(14),
  },
  timingKey: {
    fontSize: px(9),
    letterSpacing: px(1),
    textTransform: "uppercase",
    color: c.muted,
  },
  timingValue: {
    fontSize: px(14),
    fontWeight: 700,
    color: c.ink,
    marginTop: px(2),
  },
  timingSub: {
    fontSize: px(10.5),
    color: c.muted,
    marginTop: px(4),
    textAlign: "right",
  },
});

function FindingRow({ item, bandKey }: { item: BandItem; bandKey: BandKey }) {
  const band = BANDS[bandKey];
  const timing = timingFor(bandKey, item.daysLeft);

  return (
    <View
      style={[
        styles.row,
        { borderLeftColor: band.color, backgroundColor: band.bg },
      ]}
      wrap={false}
    >
      <View style={styles.main}>
        <View style={styles.itemTitle}>
          <View style={[styles.icon, { backgroundColor: band.color }]}>
            <Text style={styles.iconText}>{band.icon}</Text>
          </View>
          <Text style={styles.itemTitleText}>{item.title}</Text>
        </View>

        {item.observation ? (
          <Text style={styles.observation}>{item.observation}</Text>
        ) : null}

        {item.danger ? (
          <Text style={styles.risk}>
            <Text style={styles.riskLabel}>If left: </Text>
            {item.danger}
          </Text>
        ) : null}

        {item.images.length > 0 ? (
          <View style={styles.photos}>
            {item.images.map((src, i) => (
              <Image key={i} src={src} style={styles.photo} />
            ))}
          </View>
        ) : null}
      </View>

      {timing ? (
        <View style={styles.timing}>
          <Text style={styles.timingKey}>{timing.label}</Text>
          <Text style={styles.timingValue}>{timing.value}</Text>
          {timing.sub ? (
            <Text style={styles.timingSub}>{timing.sub}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** The body of the report: one section per urgency band, worst first. */
export function FindingBands({ bands }: { bands: Band[] }) {
  return (
    <>
      {bands.map((band) => {
        const style = BANDS[band.key];
        return (
          <View key={band.key} style={styles.band}>
            <View
              style={[styles.head, { borderBottomColor: style.color }]}
              minPresenceAhead={px(70)}
            >
              <Text style={[styles.title, { color: style.color }]}>
                {style.title}
              </Text>
              <Text style={styles.when}>{style.when}</Text>
              <Text style={styles.count}>{itemCount(band.items.length)}</Text>
            </View>

            {band.items.map((item, i) => (
              <FindingRow key={i} item={item} bandKey={band.key} />
            ))}
          </View>
        );
      })}
    </>
  );
}
