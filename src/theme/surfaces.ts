/*
 * Cards and panels lean on shadow, not borders: the faintest edge to hold the
 * shape, and a soft shadow to lift it off the page.
 */

/** Barely there: just enough to hold the card's edge. */
export const FAINT_EDGE = "rgba(20, 38, 61, 0.05)";

/** Between cells and rows inside a card. */
export const FAINT_DIVIDER = "rgba(20, 38, 61, 0.06)";

/** A card resting on the page. */
export const CARD_SHADOW =
  "0 1px 2px rgba(16, 35, 59, 0.05), 0 4px 14px rgba(16, 35, 59, 0.05)";
