import type { TokenDefinition } from "node_modules/@chakra-ui/react/dist/types/styled-system/types";

export const colors: TokenDefinition["colors"] = {
  transparent: { value: "transparent" },
  current: { value: "currentColor" },
  black: { value: "#2c2c2c" }, // Brand black RGB(44,44,44)
  white: { value: "#FFFFFF" }, // Brand white

  // Primary - Brand Red (#b70808)
  primary: {
    50: { value: "#fde8e8" },
    75: { value: "#f9b8b8" },
    100: { value: "#f28888" },
    200: { value: "#e84545" },
    300: { value: "#b70808" },
    400: { value: "#950606" },
    500: { value: "#7a0505" },
    DEFAULT: { value: "#b70808" },
  },

  // Neutral grays derived from brand black
  gray: {
    50: { value: "#f5f5f5" },
    75: { value: "#e0e0e0" },
    100: { value: "#c2c2c2" },
    200: { value: "#9e9e9e" },
    300: { value: "#757575" },
    400: { value: "#424242" },
    500: { value: "#2c2c2c" },
  },

  // Secondary - Complementary neutral for backgrounds
  secondary: {
    50: { value: "#fafafa" },
    75: { value: "#f0f0f0" },
    100: { value: "#e8e8e8" },
    200: { value: "#d4d4d4" },
    300: { value: "#a8a8a8" },
    400: { value: "#6b6b6b" },
    500: { value: "#4a4a4a" },
    DEFAULT: { value: "#a8a8a8" },
  },

  // Error - Using your brand red for errors (semantic consistency)
  error: {
    50: { value: "#fde8e8" },
    75: { value: "#f9b8b8" },
    100: { value: "#f28888" },
    200: { value: "#e84545" },
    300: { value: "#b70808" }, // Brand red
    400: { value: "#950606" },
    500: { value: "#7a0505" },
  },

  // Success - Green for positive actions
  success: {
    50: { value: "#e6f4e9" },
    75: { value: "#98d1a4" },
    100: { value: "#6dbf7e" },
    200: { value: "#2fa346" },
    300: { value: "#049020" },
    400: { value: "#036516" },
    500: { value: "#025814" },
  },

  // Warning - Orange for warnings
  warning: {
    50: { value: "#fff8e6" },
    100: { value: "#ffe3b0" },
    200: { value: "#ffd68a" },
    300: { value: "#ffb733" },
    400: { value: "#ffa500" },
    500: { value: "#e89600" },
    600: { value: "#b57500" },
    700: { value: "#8c5b00" },
    800: { value: "#6b4500" },
    900: { value: "#4a3000" },
  },

  // Info - Blue for informational elements
  info: {
    50: { value: "#e8f4fd" },
    100: { value: "#b8ddf9" },
    200: { value: "#88cbf5" },
    300: { value: "#4db0ef" },
    400: { value: "#2b9fea" },
    500: { value: "#1a8cd8" },
    600: { value: "#1570b3" },
    700: { value: "#10578c" },
    800: { value: "#0c4268" },
    900: { value: "#082f4a" },
  },
};
