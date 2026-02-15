import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: ".625rem",
    fontSize: "1rem",
    fontWeight: "400",
    backgroundColor: "primary",
    py: "1.625rem",
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
        textStyle: "small-regular",
        color: "white",
        px: "1.25rem",
        _hover: { bg: "primary.400" },
        _focus: {
          bg: "primary.400",
        },
        _disabled: {
          bg: "gray.50",
          color: "gray.75",
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
      outline: {
        bg: "transparent",
        color: "primary.400",
        border: "1px solid",
        borderColor: "primary.400",
        _hover: { bg: "primary.400", color: "white" },
        _focus: { bg: "primary.400", color: "white" },

        _disabled: {
          bg: "transparent",
          color: "gray.50",
          border: "1px solid",
          borderColor: "gray.50",
        },
      },
      outlineSecondary: {
        textStyle: "small-regular",
        bg: "white",
        color: "gray.200",
        border: "1px solid #EBEBEB",
        _hover: { bg: "primary.400", color: "white" },
        _focus: { bg: "transparent" },

        _disabled: {
          bg: "transparent",
          color: "gray.50",
          border: "1px solid",
          borderColor: "gray.50",
        },
      },
      ghost: {
        bg: "transparent",
        color: "primary.300",
        border: "none",
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
        h: "3.25rem",
        fontSize: ".875rem",
        py: "1rem",
      },
      lg: {
        // h: '3.25rem',
        px: "2rem",
        fontSize: "5rem",
      },
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
