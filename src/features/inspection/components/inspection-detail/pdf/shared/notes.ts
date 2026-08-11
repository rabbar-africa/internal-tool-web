// The source template drops the notes HTML straight into the page. react-pdf
// can't render HTML, so it's parsed into blocks that keep the structure that
// carries meaning: headings, list items and bold runs.

export interface Segment {
  text: string;
  bold?: boolean;
}

export interface NoteBlock {
  kind: "heading" | "paragraph" | "bullet" | "number";
  segments: Segment[];
  marker?: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  bull: "•",
  deg: "°",
  copy: "©",
  reg: "®",
  trade: "™",
};

const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] !== "#") return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    const code =
      body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });

/** Collapse whitespace and trim the block's outer edges, keeping bold runs. */
function tidy(segments: Segment[]): Segment[] {
  const out = segments
    .map((s) => ({ ...s, text: s.text.replace(/\s+/g, " ") }))
    .filter((s) => s.text !== "");
  if (out.length) {
    out[0] = { ...out[0], text: out[0].text.replace(/^\s+/, "") };
    const last = out.length - 1;
    out[last] = { ...out[last], text: out[last].text.replace(/\s+$/, "") };
  }
  return out.filter((s) => s.text !== "");
}

/** Notes typed as plain text still get their bullets and numbering honoured. */
function parsePlainNotes(text: string): NoteBlock[] {
  return decodeEntities(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): NoteBlock => {
      const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (numbered) {
        return {
          kind: "number",
          marker: `${numbered[1]}.`,
          segments: [{ text: numbered[2] }],
        };
      }
      const bulleted = line.match(/^[•\-*]\s+(.*)$/);
      if (bulleted) {
        return {
          kind: "bullet",
          marker: "•",
          segments: [{ text: bulleted[1] }],
        };
      }
      return { kind: "paragraph", segments: [{ text: line }] };
    });
}

export function parseNotes(html?: string): NoteBlock[] {
  if (!html?.trim()) return [];
  if (!/<[a-z][^>]*>/i.test(html)) return parsePlainNotes(html);

  const blocks: NoteBlock[] = [];
  const lists: { ordered: boolean; count: number }[] = [];
  let segments: Segment[] = [];
  let kind: NoteBlock["kind"] = "paragraph";
  let marker: string | undefined;
  let bold = 0;

  const flush = () => {
    const tidied = tidy(segments);
    if (tidied.length) blocks.push({ kind, segments: tidied, marker });
    segments = [];
    kind = "paragraph";
    marker = undefined;
  };

  const tagPattern = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html))) {
    const chunk = html.slice(cursor, match.index);
    if (chunk) segments.push({ text: decodeEntities(chunk), bold: bold > 0 });
    cursor = tagPattern.lastIndex;

    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();

    switch (tag) {
      case "strong":
      case "b":
        bold = closing ? Math.max(0, bold - 1) : bold + 1;
        break;
      case "ul":
      case "ol":
        flush();
        if (closing) lists.pop();
        else lists.push({ ordered: tag === "ol", count: 0 });
        break;
      case "li": {
        flush();
        if (closing) break;
        const list = lists[lists.length - 1];
        if (list?.ordered) {
          list.count += 1;
          kind = "number";
          marker = `${list.count}.`;
        } else {
          kind = "bullet";
          marker = "•";
        }
        break;
      }
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        flush();
        if (!closing) kind = "heading";
        break;
      case "p":
      case "div":
      case "br":
      case "tr":
        flush();
        break;
      default:
        break; // inline tags (span, em, a…) keep their text in the current block
    }
  }

  const tail = html.slice(cursor);
  if (tail) segments.push({ text: decodeEntities(tail), bold: bold > 0 });
  flush();

  return blocks;
}
