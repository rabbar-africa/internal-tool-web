import type { CustomCheckboxProps } from "@/shared/interface/input";
import { Checkbox, Field } from "@chakra-ui/react";

export function CustomCheckbox({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  register,
  children,
  width,
  rootProps,
  controlProps,
  checked,
  onCheckedChange,
  value,
  labelProps,
  ...props
}: CustomCheckboxProps) {
  return (
    <Field.Root required={required} invalid={!!error} disabled={disabled}>
      <Checkbox.Root
        width={width}
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
        {...rootProps}
        {...props}
      >
        <Checkbox.HiddenInput value={value} {...register} />
        <Checkbox.Control
          rounded={{ base: ".15rem", md: ".3rem" }}
          {...controlProps}
        >
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label textStyle={"small-regular"} {...labelProps}>
          {label || children}
          {/* {required && <Field.RequiredIndicator />} */}
        </Checkbox.Label>
      </Checkbox.Root>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
}
