import { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "./CustomSelect";

interface Option {
  label: string;
  value: string;
}

interface SelectOrTypeFieldProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  /** Placeholder for the select mode. */
  placeholder?: string;
  /** Placeholder for the manual-typing mode. */
  typePlaceholder?: string;
  name?: string;
}

/**
 * A field that lets the user pick from a list OR type a value manually — for
 * lookups (like vehicle make/model) whose options never fully cover reality.
 * A small toggle beside the label flips between the two modes, mirroring the
 * "type it" affordance next to the invoice customer combobox.
 */
export function SelectOrTypeField({
  label,
  required,
  disabled,
  loading,
  options,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  typePlaceholder,
  name,
}: SelectOrTypeFieldProps) {
  const [mode, setMode] = useState<"select" | "type">("select");

  // If a value is present that isn't one of the options (e.g. prefilled from a
  // custom entry), start in type mode so it stays visible and editable.
  useEffect(() => {
    if (value && !options.some((o) => o.value === value)) {
      setMode("type");
    }
    // Only react to the option set loading in, not every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const toggle = () => setMode((m) => (m === "select" ? "type" : "select"));

  return (
    <Box>
      <Flex justify="space-between" align="center" mb=".625rem">
        <Text as="label" textStyle="tiny-semibold" color="gray.300">
          {label}
          {required && (
            <Text as="span" color="error.300">
              {" "}
              *
            </Text>
          )}
        </Text>
        <Button
          type="button"
          variant="ghost"
          h="auto"
          minW="0"
          p="0"
          fontSize="11px"
          fontWeight="500"
          color="primary.500"
          _hover={{ textDecoration: "underline" }}
          disabled={disabled}
          onClick={toggle}
        >
          {mode === "select" ? "Type manually" : "Choose from list"}
        </Button>
      </Flex>

      {mode === "select" ? (
        <CustomSelect
          placeholder={placeholder}
          options={options}
          loading={loading}
          disabled={disabled}
          value={value ? [value] : undefined}
          onChange={(opt: { value: string[] }) =>
            onChange(opt?.value?.[0] ?? "")
          }
          error={error}
        />
      ) : (
        <CustomInput
          name={name}
          disabled={disabled}
          placeholder={typePlaceholder ?? placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          onBlur={onBlur}
          error={error}
        />
      )}
    </Box>
  );
}
