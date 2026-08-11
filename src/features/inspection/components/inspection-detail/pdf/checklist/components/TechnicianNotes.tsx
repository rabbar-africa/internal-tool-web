import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { inspectionColors as c, px } from "../colors";
import type { NoteBlock, Segment } from "../../shared/notes";

// Styled as a sibling of the scope panel — a bordered block in the body flow.
const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: c.hair,
    paddingVertical: px(14),
    paddingHorizontal: px(16),
    marginBottom: px(24),
  },
  sectionHeading: {
    fontSize: px(11),
    letterSpacing: px(1.1),
    textTransform: "uppercase",
    color: c.inkSoft,
    marginBottom: px(8),
  },
  text: { fontSize: px(12), color: c.inkSoft, lineHeight: 1.55 },
  heading: {
    fontSize: px(12.5),
    fontWeight: 600,
    color: c.ink,
    marginTop: px(12),
    marginBottom: px(5),
  },
  paragraph: { marginBottom: px(6) },
  listItem: {
    flexDirection: "row",
    marginBottom: px(4),
    paddingLeft: px(16),
  },
  marker: {
    fontSize: px(12),
    color: c.muted,
    width: px(14),
    lineHeight: 1.55,
  },
  bold: { fontWeight: 600, color: c.ink },
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

/** Anything the technician wrote that the advisory bands don't already cover. */
export function TechnicianNotes({ blocks }: { blocks: NoteBlock[] }) {
  if (!blocks.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Technician notes</Text>
      {blocks.map((block, i) => (
        <Block key={i} block={block} isFirst={i === 0} />
      ))}
    </View>
  );
}
