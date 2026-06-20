import { Flex, Input, Text } from "@chakra-ui/react";
import type { FlexProps } from "@chakra-ui/react";

export interface DateFieldProps {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  /** Overrides applied to the outer wrapper (e.g. width, flex). */
  containerProps?: FlexProps;
}

/**
 * Compact labeled date picker — an inline "Label: [date]" control with the
 * border on the wrapper so the label and native date input read as one field.
 */
export function DateField({
  label,
  value,
  min,
  max,
  onChange,
  containerProps,
}: DateFieldProps) {
  return (
    <Flex
      alignItems="center"
      h="2.5rem"
      px="0.75rem"
      borderRadius="0.5rem"
      borderWidth="1px"
      borderColor="gray.50"
      bg="white"
      gap="0.5rem"
      _focusWithin={{ borderColor: "primary.300", shadow: "sm" }}
      {...containerProps}
    >
      <Text textStyle="small-regular" color="gray.300" whiteSpace="nowrap">
        {label}:
      </Text>
      <Input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        variant="outline"
        border="none"
        p="0"
        h="auto"
        minW="7rem"
        color={value ? "gray.500" : "gray.300"}
        _focus={{ outline: "none", shadow: "none" }}
      />
    </Flex>
  );
}
