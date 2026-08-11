import { StyleSheet } from "@react-pdf/renderer";
import { inspectionColors as c, PAGE_MARGIN, px } from "./colors";

/**
 * The page shell. The masthead, verdict bar and footer bleed to the page edges,
 * so the page itself carries no horizontal padding — each band sets its own.
 */
export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: PAGE_MARGIN,
    paddingBottom: PAGE_MARGIN,
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: px(13),
    color: c.ink,
    backgroundColor: c.paper,
  },
  /** The report body, inset from the full-bleed bands above and below it. */
  body: {
    paddingTop: px(26),
    paddingBottom: px(30),
    paddingHorizontal: px(34),
  },
});
