/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Field, Input } from "@chakra-ui/react";
import type { CustomNumberInputProps } from "@/shared/interface/input";

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  variant = "outline",
  size = "lg",
  error,
  min,
  max,
  step = 1,
  precision = 0,
  format = "number",
  currency = "USD",
  thousandSeparator = ",",
  decimalSeparator = ".",
  allowNegative = true,
  register,
  onValueChange,
  ...props
}) => {
  const [value, setValue] = React.useState<string>("");
  const [, setNumericValue] = React.useState<number | undefined>();

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "";

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    switch (format) {
      case "currency":
        options.style = "currency";
        options.currency = currency;
        break;
      case "percentage":
        options.style = "percent";
        break;
      default:
        options.useGrouping = true;
    }

    return new Intl.NumberFormat("en-US", options).format(num);
  };

  const parseNumber = (str: string): number | undefined => {
    if (!str) return undefined;

    // Remove formatting characters but keep decimal point and minus sign
    const cleaned = str.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? undefined : parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsed = parseNumber(inputValue);

    if (parsed !== undefined) {
      if (min !== undefined && parsed < min) return;
      if (max !== undefined && parsed > max) return;
      if (!allowNegative && parsed < 0) return;

      const formatted = formatNumber(parsed);
      setValue(formatted);
      setNumericValue(parsed);
      onValueChange?.(formatted, parsed);
    } else if (inputValue === "" || inputValue === "-") {
      setValue(inputValue);
      setNumericValue(undefined);
      onValueChange?.(inputValue, undefined);
    }
  };

  return (
    <Field.Root required={required} invalid={!!error} disabled={disabled}>
      {label && (
        <Field.Label>
          {label}
          {required && <Field.RequiredIndicator />}
        </Field.Label>
      )}
      <Input
        type="text"
        placeholder={placeholder}
        variant={variant}
        size={size}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        {...props}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
};
