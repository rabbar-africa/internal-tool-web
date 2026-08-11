import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { inspectionColors as c, px } from "../colors";
import { sharedStyles } from "../styles";
import type { NoteBlock, Segment } from "../../shared/notes";

const styles = StyleSheet.create({
  section: { paddingVertical: px(18), paddingHorizontal: px(24) },
  card: {
    backgroundColor: c.sectionBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: px(8),
    paddingVertical: px(16),
    paddingHorizontal: px(20),
  },
  text: { fontSize: px(10), color: c.textPrimary, lineHeight: 1.6 },
  heading: {
    fontSize: px(12),
    fontWeight: 700,
    color: c.textPrimary,
    marginTop: px(14),
    marginBottom: px(6),
  },
  paragraph: { marginBottom: px(6) },
  listItem: {
    flexDirection: "row",
    marginBottom: px(4),
    paddingLeft: px(24),
  },
  marker: {
    fontSize: px(10),
    color: c.textSecondary,
    width: px(16),
    lineHeight: 1.6,
  },
  bold: { fontWeight: 600 },
  listBody: { flex: 1 },
});

/** Bold runs render as nested Text so they stay inline with their sentence. */
function Segments({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((segment, i) => (
        <Text key={i} style={segment.bold ? styles.bold : undefined}>
          {segment.text}
        </Text>
      ))}
    </>
  );
}

function Block({ block, isFirst }: { block: NoteBlock; isFirst: boolean }) {
  if (block.kind === "heading") {
    return (
      <Text style={[styles.heading, isFirst ? { marginTop: 0 } : {}]}>
        <Segments segments={block.segments} />
      </Text>
    );
  }

  if (block.kind === "bullet" || block.kind === "number") {
    return (
      <View style={styles.listItem}>
        <Text style={styles.marker}>{block.marker}</Text>
        <Text style={[styles.text, styles.listBody]}>
          <Segments segments={block.segments} />
        </Text>
      </View>
    );
  }

  return (
    <Text style={[styles.text, styles.paragraph]}>
      <Segments segments={block.segments} />
    </Text>
  );
}

/** The source starts the notes on their own page; `break` reproduces that. */
export function TechnicianNotes({ blocks }: { blocks: NoteBlock[] }) {
  if (!blocks.length) return null;

  return (
    <View style={styles.section} break>
      <Text style={sharedStyles.sectionHeading}>
        Technician Notes &amp; Recommendations
      </Text>
      <View style={styles.card}>
        {blocks.map((block, i) => (
          <Block key={i} block={block} isFirst={i === 0} />
        ))}
      </View>
    </View>
  );
}
