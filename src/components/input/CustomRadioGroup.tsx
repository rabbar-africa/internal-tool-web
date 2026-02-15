import React from "react";
import type { CustomRadioGroupProps } from "@/shared/interface/input";
import { Field, RadioGroup, HStack, VStack } from "@chakra-ui/react";

export const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  register,
  direction = "row",
  items = [],
  labelProps,
  itemTextProps,
  rootProps,
  value,
  ...props
}) => {
  const Stack = direction === "row" ? HStack : VStack;

  return (
    <Field.Root gap={0} required={true} invalid={!!error} disabled={disabled}>
      {label && (
        <Field.Label
          mb={".625rem"}
          textStyle={"tiny-semibold"}
          color={"gray.300"}
          {...labelProps}
        >
          {label}
          {required && <Field.RequiredIndicator />}
        </Field.Label>
      )}

      <RadioGroup.Root
        {...register}
        {...props}
        disabled={disabled}
        variant="outline"
        {...rootProps}
        value={value || []}
      >
        <Stack gap="4">
          {items.map((item) => (
            <RadioGroup.Item key={item.value} value={item.value}>
              <RadioGroup.ItemHiddenInput required={required} />
              <RadioGroup.ItemIndicator
                _checked={{
                  color: "primary",
                  borderColor: "primary",
                }}
              />
              <RadioGroup.ItemText
                textStyle={"small-regular"}
                {...itemTextProps}
              >
                {item.label}
              </RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>

      {error && (
        <Field.ErrorText mt={".25rem"} fontSize={".625rem"}>
          {error}
        </Field.ErrorText>
      )}
      {helperText && !error && (
        <Field.HelperText mt={".25rem"} fontSize={".625rem"}>
          {helperText}
        </Field.HelperText>
      )}
    </Field.Root>
  );
};
