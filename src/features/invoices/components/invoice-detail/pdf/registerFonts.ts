import { Font } from "@react-pdf/renderer";
import poppins400 from "@/assets/fonts/poppins/poppins-400.ttf";
import poppins500 from "@/assets/fonts/poppins/poppins-500.ttf";
import poppins600 from "@/assets/fonts/poppins/poppins-600.ttf";
import poppins700 from "@/assets/fonts/poppins/poppins-700.ttf";

let registered = false;

/**
 * Registers Poppins (the app's brand font, see src/theme/custom/font.ts) with
 * @react-pdf/renderer so generated PDFs match the on-screen rendering. Fonts
 * are bundled locally (no runtime CDN fetch). Idempotent.
 */
export function registerPdfFonts() {
  if (registered) return;
  Font.register({
    family: "Poppins",
    fonts: [
      { src: poppins400, fontWeight: 400 },
      { src: poppins500, fontWeight: 500 },
      { src: poppins600, fontWeight: 600 },
      { src: poppins700, fontWeight: 700 },
    ],
  });
  // Poppins has no hyphenation needs for our short content; disable the default
  // hyphenation callback so words aren't split mid-line.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
