import { StyleSheet } from "@react-pdf/renderer";
import { inspectionColors as c, PAGE_MARGIN, px } from "./colors";

/**
 * The page shell and the one heading treatment that spans sections. Everything
 * else lives beside the component that draws it, mirroring the source
 * template's one-stylesheet-per-component layout.
 */
export const sharedStyles = StyleSheet.create({
  page: {
    padding: PAGE_MARGIN,
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: px(10),
    color: c.textPrimary,
    backgroundColor: c.pageBg,
  },
  sectionHeading: {
    fontSize: px(15),
    fontWeight: 600,
    color: c.textPrimary,
    marginBottom: px(12),
    paddingBottom: px(8),
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
});
