import { createIcon } from "@chakra-ui/react";

/*
 * Line icons for buttons: 24-unit grid, 2px rounded strokes in the current
 * colour, drawn at 16px. Bolder than the filled set, so they sit well beside
 * button text.
 */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const PlusLine = createIcon({
  displayName: "PlusLine",
  viewBox: "0 0 24 24",
  path: <path {...stroke} d="M12 5v14M5 12h14" />,
});

export const ChevronDownLine = createIcon({
  displayName: "ChevronDownLine",
  viewBox: "0 0 24 24",
  path: <path {...stroke} d="m6 9 6 6 6-6" />,
});

export const DownloadLine = createIcon({
  displayName: "DownloadLine",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path {...stroke} d="M12 4v11" />
      <path {...stroke} d="m7 10 5 5 5-5" />
      <path {...stroke} d="M5 20h14" />
    </>
  ),
});

export const CheckLine = createIcon({
  displayName: "CheckLine",
  viewBox: "0 0 24 24",
  path: <path {...stroke} d="M20 6 9 17l-5-5" />,
});
