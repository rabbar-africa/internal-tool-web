import { Font } from "@react-pdf/renderer";
import inter400 from "@/assets/fonts/inter/inter-400.ttf";
import inter500 from "@/assets/fonts/inter/inter-500.ttf";
import inter600 from "@/assets/fonts/inter/inter-600.ttf";
import inter700 from "@/assets/fonts/inter/inter-700.ttf";

let registered = false;

/**
 * Registers Inter for the inspection report. The document this one replaces was
 * printed by the backend from a template whose font stack is
 * `"Geist", "Geist Fallback", "Inter", …` — never the app's Poppins — so
 * matching it keeps the two outputs indistinguishable. Poppins' geometric
 * letterforms read noticeably heavier at the same weights.
 *
 * Fonts are bundled locally (no runtime CDN fetch). Idempotent.
 */
export function registerInspectionPdfFonts() {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: inter400, fontWeight: 400 },
      { src: inter500, fontWeight: 500 },
      { src: inter600, fontWeight: 600 },
      { src: inter700, fontWeight: 700 },
    ],
  });
  // Keep words whole rather than hyphenating them mid-line.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
