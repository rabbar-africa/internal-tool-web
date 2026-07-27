import { defineRecipe } from "@chakra-ui/react";

export const inputRecipe = defineRecipe({
  base: {
    border: "1px solid",
    borderColor: "red.50 !important",
    borderRadius: ".625rem",
    height: "3rem",
    px: "1rem",
    bg: "field.bg",
    color: "gray.300",
    // ≥16px on mobile or iOS Safari zooms the page when the input is focused
    fontSize: { base: "1rem", lg: ".875rem" },
    transition: "all 0.2s",
    outline: "none",
    _placeholder: {
      color: "gray.100",
      fontWeight: "400",
      fontSize: { base: "1rem", lg: ".875rem" },
    },
    _focus: {
      // borderColor: 'field.borderFocus',
      boxShadow: "0 0 0 1px {colors.primary.500}",
      outline: "none",
    },
    _invalid: {
      // borderColor: 'field.borderError',
      boxShadow: "0 0 0 1px {colors.error.500}",
    },
    _disabled: {
      bg: "field.bgDisabled",
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
  variants: {
    // Chakra's default size variants set fontSize via textStyle, which wins
    // over any base fontSize — re-declare each size with a responsive
    // textStyle so mobile gets a 1rem floor and lg+ keeps the original size.
    size: {
      "2xs": { textStyle: { base: "md", lg: "xs" } },
      xs: { textStyle: { base: "md", lg: "xs" } },
      sm: { textStyle: { base: "md", lg: "sm" } },
      md: { textStyle: { base: "md", lg: "sm" } },
      lg: { textStyle: "md" },
      xl: { textStyle: "md" },
      "2xl": { textStyle: { base: "md", lg: "lg" } },
    },
    variant: {
      outline: {
        borderWidth: "1px",
        borderStyle: "solid",
      },
      subtle: {
        border: "none",
        bg: "field.bgDisabled",
        _focus: {
          bg: "field.bg",
          // borderColor: 'field.borderFocus',
          border: "1px solid",
          boxShadow: "0 0 0 1px {colors.primary.500}",
        },
      },
      flushed: {
        border: "none",
        borderBottom: "2px solid",
        borderRadius: "0",
        px: "0",
        _focus: {
          // borderColor: 'field.borderFocus',
          boxShadow: "none",
        },
      },
    },
  },

  defaultVariants: {
    variant: "outline",
  },
});
