import { useEffect } from "react";

const RESPONSIVE_VIEWPORT = "width=device-width, initial-scale=1.0";

/**
 * Pins the page to a fixed virtual width on mobile so it renders the full
 * desktop layout, scaled down to fit the screen (the "desktop mode" effect,
 * like Zoho Books). On unmount the responsive viewport is restored, so only
 * the page that opts in is affected — every other route stays responsive.
 *
 * SPA-safe: route changes don't reload the document, so we mutate the single
 * existing <meta name="viewport"> tag rather than rendering a second one
 * (two viewport tags behave unreliably, especially on iOS Safari).
 */
export function useForceDesktopViewport(width = 1280) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    if (!meta) return;

    const previous = meta.getAttribute("content") ?? RESPONSIVE_VIEWPORT;
    meta.setAttribute("content", `width=${width}`);

    return () => {
      meta.setAttribute("content", previous);
    };
  }, [width]);
}

interface ForceDesktopViewProps {
  /** Virtual viewport width to render at. Defaults to 1280px. */
  width?: number;
}

/**
 * Drop-in component version of {@link useForceDesktopViewport}. Render it once
 * near the top of any page that should show the desktop layout on mobile:
 *
 * ```tsx
 * <ForceDesktopView />
 * ```
 */
export function ForceDesktopView({ width = 1280 }: ForceDesktopViewProps) {
  useForceDesktopViewport(width);
  return null;
}
