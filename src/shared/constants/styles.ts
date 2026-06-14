import type { SystemStyleObject } from "@chakra-ui/react";

/**
 * Thin, transparent-until-hover scrollbar. Spread onto any scrollable
 * Chakra element (e.g. a scrollable Dialog.Body) via the `css` prop.
 */
export const chakraScrollbarStyle: SystemStyleObject = {
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-thumb": {
    background: "transparent",
    borderRadius: "lg",
  },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&:hover::-webkit-scrollbar-thumb": { background: "#d1d1d1" },
  scrollbarColor: "#d1d1d1 transparent",
  scrollbarWidth: "thin",
};
