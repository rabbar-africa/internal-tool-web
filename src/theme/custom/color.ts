import type { TokenDefinition } from "node_modules/@chakra-ui/react/dist/types/styled-system/types";

export const colors: TokenDefinition["colors"] = {
  transparent: { value: "transparent" },
  current: { value: "currentColor" },
  black: { value: "#001F3E" }, // Maastricht blue
  white: { value: "#FFFFFF" },

  // Primary - Cool black (#013064)
  primary: {
    50: { value: "#e6ecf3" },
    75: { value: "#b3c5da" },
    100: { value: "#809ec1" },
    200: { value: "#4d77a8" },
    300: { value: "#013064" },
    400: { value: "#012751" },
    500: { value: "#001F3E" },
    DEFAULT: { value: "#013064" },
  },

  // Neutral grays (Cultured #F4F4F4 as lightest)
  gray: {
    50: { value: "#F4F4F4" },
    75: { value: "#e0e0e0" },
    100: { value: "#c2c2c2" },
    200: { value: "#9e9e9e" },
    300: { value: "#757575" },
    400: { value: "#424242" },
    500: { value: "#1a1a2e" },
  },

  // Secondary - Maximum green yellow (#DAE648)
  secondary: {
    50: { value: "#fbfde9" },
    75: { value: "#f1f5b5" },
    100: { value: "#e9f08a" },
    200: { value: "#e1eb5f" },
    300: { value: "#DAE648" },
    400: { value: "#aeb83a" },
    500: { value: "#838a2b" },
    DEFAULT: { value: "#DAE648" },
  },

  // Error - Red for errors
  error: {
    50: { value: "#fde8e8" },
    75: { value: "#f9b8b8" },
    100: { value: "#f28888" },
    200: { value: "#e84545" },
    300: { value: "#d32f2f" },
    400: { value: "#b71c1c" },
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

  // Info - derived from primary blue palette
  info: {
    50: { value: "#e6ecf3" },
    100: { value: "#b3c5da" },
    200: { value: "#809ec1" },
    300: { value: "#4d77a8" },
    400: { value: "#013064" },
    500: { value: "#012751" },
    600: { value: "#001F3E" },
    700: { value: "#001830" },
    800: { value: "#001224" },
    900: { value: "#000c18" },
  },
};
