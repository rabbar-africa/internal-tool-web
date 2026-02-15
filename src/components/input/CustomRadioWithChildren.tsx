import React from "react";
import type { CustomRadioGroupProps } from "@/shared/interface/input";
import { Field, RadioGroup } from "@chakra-ui/react";

export const CustomRadioWithChildren: React.FC<CustomRadioGroupProps> = ({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  register,
  items = [],
  itemProps,
  labelProps,
  rootProps,
  //   itemTextProps,
  // children,
  value,
  ...props
}) => {
  return (
    <Field.Root
      gap={0}
      required={required}
      invalid={!!error}
      disabled={disabled}
    >
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
        disabled={disabled}
        {...register}
        {...props}
        {...rootProps}
        variant="outline"
        value={value || []}
      >
        {items.map((item) => (
          <RadioGroup.Item {...itemProps} key={item.value} value={item.value}>
            <RadioGroup.ItemHiddenInput required={required} />
            {item.label}
            <RadioGroup.ItemIndicator
              _checked={{
                color: "primary",
                borderColor: "primary",
              }}
              borderColor={"#8A8A8A"}
            />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>

      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
};
