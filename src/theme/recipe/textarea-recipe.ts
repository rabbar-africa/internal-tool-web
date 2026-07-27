import { defineRecipe } from "@chakra-ui/react";

// Merged with Chakra's default textarea recipe. The default size variants set
// fontSize via textStyle, which is below 16px for xs–md — iOS Safari zooms the
// page when focusing any field under 16px, so enforce a 1rem floor on mobile
// (textStyle "md") and restore the original sizes from lg up.
export const textareaRecipe = defineRecipe({
  base: {
    fontSize: { base: "1rem", lg: ".875rem" },
  },
  variants: {
    size: {
      xs: { textStyle: { base: "md", lg: "xs" } },
      sm: { textStyle: { base: "md", lg: "sm" } },
      md: { textStyle: { base: "md", lg: "sm" } },
      lg: { textStyle: "md" },
      xl: { textStyle: "md" },
    },
  },
});
