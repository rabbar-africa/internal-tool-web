/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from "react";
import { Field, Input, Box } from "@chakra-ui/react";
import type { FieldLabelProps, InputProps } from "@chakra-ui/react";
import type { CustomNumberInputProps } from "@/shared/interface/input";

export const CustomNumberInput: React.FC<
  CustomNumberInputProps & {
    inputProps?: InputProps;
    labelProps?: FieldLabelProps;
  }
> = ({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  error,
  min,
  max,
  step: _step,
  precision = 2,
  format: _format,
  currency: _currency,
  thousandSeparator: _thousandSeparator,
  decimalSeparator: _decimalSeparator,
  allowNegative = true,
  onValueChange,
  value: valueProp,
  onChange: _onChange,
  register: _register,
  variant: _variant,
  size: _size,
  name,
  onBlur,
  inputProps,
  labelProps,
}) => {
  const [displayValue, setDisplayValue] = React.useState<string>("");
  const isFocused = useRef(false);

  const formatNum = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
      useGrouping: true,
    }).format(n);

  const parseRaw = (str: string): number | undefined => {
    const cleaned = str.replace(/[^\d.-]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? undefined : n;
  };

  // Sync from external value changes (e.g. handleItemSelect sets rate)
  useEffect(() => {
    if (isFocused.current) return;
    if (valueProp !== undefined && valueProp !== "" && valueProp !== null) {
      const n = parseRaw(String(valueProp));
      setDisplayValue(n !== undefined ? formatNum(n) : "");
    } else {
      setDisplayValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueProp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const stripped = allowNegative
      ? rawInput.replace(/[^\d.-]/g, "")
      : rawInput.replace(/[^\d.]/g, "");

    if (stripped === "" || stripped === ".") {
      setDisplayValue(stripped);
      onValueChange?.("", undefined);
      return;
    }

    const hasTrailingDot = stripped.endsWith(".");
    const n = parseFloat(stripped);

    if (isNaN(n)) {
      setDisplayValue(stripped);
      return;
    }

    if (min !== undefined && n < min) return;
    if (max !== undefined && n > max) return;
    if (!allowNegative && n < 0) return;

    const formatted = formatNum(n) + (hasTrailingDot ? "." : "");
    setDisplayValue(formatted);
    onValueChange?.(String(n), n);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocused.current = false;
    const n = parseRaw(e.target.value);
    if (n !== undefined) setDisplayValue(formatNum(n));
    onBlur?.(e);
  };

  return (
    <Field.Root
      gap={0}
      required={required}
      invalid={!!error}
      disabled={disabled}
    >
      {label && (
        <Field.Label
          mb=".625rem"
          textStyle="tiny-semibold"
          color="gray.300"
          {...labelProps}
        >
          {label}
          {required && <Field.RequiredIndicator color="error.300" mb={0} />}
        </Field.Label>
      )}
      <Box position="relative" w="100%">
        <Input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          px="16px"
          borderColor="gray.100"
          h="2.5rem"
          color="gray.500"
          _placeholder={{ textStyle: "tiny-regular", color: "gray.100" }}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          {...inputProps}
        />
      </Box>
      {error && (
        <Field.ErrorText mt=".25rem" fontSize=".625rem">
          {error}
        </Field.ErrorText>
      )}
      {helperText && !error && (
        <Field.HelperText mt=".25rem" fontSize=".625rem">
          {helperText}
        </Field.HelperText>
      )}
    </Field.Root>
  );
};
