// Layout comes from the reference sheet (src/for-claude/inspection.html), but
// the palette is the house one shared with the classic report — the navy band
// and the green / amber / red status trio.
//
// Colors originally expressed as rgba() over a known background are
// pre-flattened to the hex they resolve to, with the source value in a comment.

export const inspectionColors = {
  ink: "#0a1628", // masthead + footer background
  inkSoft: "#3B4A5E",
  muted: "#7A8798",
  hair: "#E5E7EB",
  paper: "#FFFFFF",

  // Ink used on the dark bands.
  onInk: "#E7E8EA", // rgba(255,255,255,.9) over ink
  onInkSoft: "#9DA2A9", // rgba(255,255,255,.6) over ink
  onInkLabel: "#9DA2A9",
  onInkRule: "#3B4553", // rgba(255,255,255,.2) over ink
  onInkRuleSoft: "#353F4D",

  markBg: "#1E3350",
  accent: "#8FD14F",

  // Status trio — same values the classic report uses, with its 10%/30% tints.
  critical: "#D90000",
  criticalBg: "#FBE5E5",
  soon: "#E69500",
  soonBg: "#FDF4E5",
  pass: "#00A300",
  passBg: "#E5F6E5",
  optional: "#6B7280",
  optionalBg: "#F9FAFB",

  riskRule: "#D6DBE1", // rgba(14,26,43,.14)
  panelBg: "#F9FAFB",
  photoSlot: "#C4CBD4",
} as const;

/**
 * The sheet is laid out in CSS pixels and printed at A4. Chrome's fixed 96 CSS
 * px per inch maps every pixel to exactly 0.75pt, so sizes are written in the
 * source's pixels and converted through `px()`.
 */
export const PX_TO_PT = 0.75;

export const px = (value: number): number =>
  Math.round(value * PX_TO_PT * 100) / 100;

/** The source's `@page { margin: 10mm }`. */
export const PAGE_MARGIN = 28.35;
