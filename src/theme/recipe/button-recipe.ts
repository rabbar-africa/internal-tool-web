import { defineRecipe } from "@chakra-ui/react";

/*
 * Sized and shaped like Invonique's buttons: 40px, 11px corners, medium
 * weight, an icon gap, and a soft shadow (solid buttons also get a faint
 * highlight along the top edge).
 */
const SOFT_SHADOW =
  "0 1px 2px rgba(16, 35, 59, 0.06), 0 1px 3px rgba(16, 35, 59, 0.06)";
const HAIRLINE = "rgba(20, 38, 61, 0.14)";
const solidShadow = (glow: string) =>
  `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px ${glow}`;

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "11px",
    fontSize: ".875rem",
    fontWeight: "500",
    gap: "2",
    transition:
      "background .15s ease, border-color .15s ease, box-shadow .15s ease, transform .1s ease",
    _active: { transform: "scale(0.98)" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "primary.200",
      outlineOffset: "2px",
    },
    backgroundColor: "primary",
    // No vertical padding here: buttons are border-box, so any `py` becomes a
    // minimum height and silently overrides the `h` set by each size.
    px: { base: "1.25rem" },
    _loading: {
      opacity: 0.6,
      cursor: "not-allowed",
      bg: "primary.300",
    },
  },
  variants: {
    variant: {
      primary: {
        bg: "primary.300",
        border: "none",
        color: "white",
        px: "1rem",
        boxShadow: solidShadow("rgba(1, 48, 100, 0.35)"),
        _hover: { bg: "primary.400" },
        _focus: {
          bg: "primary.400",
        },
        _disabled: {
          bg: "gray.50",
          color: "gray.75",
          boxShadow: "none",
        },
      },
      /**
       * The brand CTA from the marketing site — acid on navy. Overrides the
       * base `_loading` background so a pending button keeps the accent
       * instead of flipping to primary.
       */
      accent: {
        bg: "secondary.300",
        color: "primary.500",
        border: "none",
        fontWeight: "600",
        boxShadow: solidShadow("rgba(131, 138, 43, 0.35)"),
        _hover: { bg: "#E8F34F" },
        _focus: { bg: "#E8F34F" },
        // Touch screens never fire hover, so a press needs its own feedback.
        _active: { bg: "#E8F34F", transform: "scale(0.98)" },
        _loading: { bg: "secondary.300", opacity: 0.6, cursor: "not-allowed" },
        _disabled: {
          bg: "gray.50",
          color: "gray.100",
          boxShadow: "none",
        },
      },
      secondary: {
        bg: "secondary.300",
        color: "white",
        border: "none",
        _hover: { bg: "secondary.400" },
        _focus: {
          bg: "secondary.300",
        },
        _disabled: {
          bg: "gray.50",
          color: "gray.75",
        },
      },
      /** White, dark text, a hairline border and a soft shadow. */
      outline: {
        bg: "white",
        color: "primary.500",
        // Longhands: a `border` shorthand would win over the colour and
        // paint the edge in the text colour.
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: HAIRLINE,
        boxShadow: SOFT_SHADOW,
        _hover: { bg: "gray.50" },
        _focus: { bg: "white" },
        _disabled: {
          bg: "white",
          color: "gray.100",
          borderColor: "gray.75",
          boxShadow: "none",
        },
      },
      /** The same, with quieter text. */
      outlineSecondary: {
        bg: "white",
        color: "gray.400",
        // Longhands: a `border` shorthand would win over the colour and
        // paint the edge in the text colour.
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: HAIRLINE,
        boxShadow: SOFT_SHADOW,
        _hover: { bg: "gray.50", color: "gray.500" },
        _focus: { bg: "white" },
        _disabled: {
          bg: "white",
          color: "gray.100",
          borderColor: "gray.75",
          boxShadow: "none",
        },
      },
      ghost: {
        bg: "transparent",
        color: "primary.300",
        border: "none",
        boxShadow: "none",
        _active: { transform: "none" },
        _hover: { bg: "transparent" },
        _focus: {
          bg: "transparent",
        },
        _disabled: {
          bg: "transparent",
          color: "primary.300",
        },
      },
      ghostGroup: {
        bg: "secondary.50",
        color: "secondary.400",
        border: "none",
        _hover: { bg: "secondary.400", color: "white" },
        _focus: {
          bg: "secondary.400",
          color: "white",
        },
        _disabled: {
          bg: "gray.50",
          color: "gray.75",
          border: "none",
        },
      },
      errorSolid: {
        bg: "error.300",
        color: "white",
        border: "none",
        boxShadow: solidShadow("rgba(211, 47, 47, 0.35)"),
        _hover: { bg: "error.400" },
        _focus: {
          bg: "error.400",
        },
        _disabled: {
          bg: "gray.50",
          color: "gray.75",
        },
      },
    },
    size: {
      sm: {
        // h: '2.25rem',
        px: "1rem",
        fontSize: "0.875rem",
      },
      md: {
        h: "2.5rem",
        px: "1rem",
        fontSize: ".875rem",
      },
      lg: {
        h: "2.75rem",
        px: "2rem",
        fontSize: "1rem",
      },
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
