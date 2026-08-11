// Design tokens copied from the backend's HTML inspection template
// (internal-tool-backend/src/rendering/templates/inspections/style.ts) so the
// frontend-generated PDF is indistinguishable from the one the server used to
// render.
//
// The source expresses several colors as rgba() over a known background. PDF
// alpha compositing is avoidable here, so each of those is pre-flattened to the
// hex it resolves to — the original value is kept in a comment.

export const inspectionColors = {
  navy: "#0a1628", // header / footer background
  navyBorder: "#3B4553", // rgba(255,255,255,0.2) over navy
  navyText: "#E7E8EA", // rgba(255,255,255,0.9) over navy
  navyMuted: "#9DA2A9", // rgba(255,255,255,0.6) over navy

  pageBg: "#ffffff",
  sectionBg: "#F9FAFB",

  border: "#E5E7EB",

  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Status colors — bg/border are the source's 10%/30% alpha tints, flattened.
  passBg: "#E5F6E5", // #00A3001A
  passBorder: "#B2E3B2", // #00A3004D
  passText: "#00A300",

  warnBg: "#FDF4E5", // #E695001A
  warnBorder: "#F8DFB2", // #E695004D
  warnText: "#E69500",

  failBg: "#FBE5E5", // #D900001A
  failBorder: "#F4B2B2", // #D900004D
  failText: "#D90000",
} as const;

/**
 * The backend prints the template with Puppeteer at the default `scale: 1`
 * (see internal-tool-backend/src/shared/services/pdf.service.ts), so Chrome's
 * fixed 96 CSS px per inch maps every CSS pixel to exactly 0.75pt. Sizes are
 * written in the template's CSS pixels and converted through `px()`, keeping
 * the numbers comparable to the original stylesheet.
 */
export const PX_TO_PT = 0.75;

export const px = (value: number): number =>
  Math.round(value * PX_TO_PT * 100) / 100;

/** The same service prints with a 20px margin on all four sides. */
export const PAGE_MARGIN = px(20);
