import React from "react";
import type { CustomSwitchProps } from "@/shared/interface/input";
import { Field, Switch } from "@chakra-ui/react";

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  helperText,
  required = false,
  disabled = false,
  reversed = false,
  error,
  register,
  children,
  rootProps,
  controlProps,
  ...props
}) => {
  return (
    <Field.Root required={required} invalid={!!error} disabled={disabled}>
      <Switch.Root disabled={disabled} {...register} {...props} {...rootProps}>
        <Switch.HiddenInput />
        {reversed && (
          <Switch.Label>
            {label || children}
            {required && <Field.RequiredIndicator />}
          </Switch.Label>
        )}
        <Switch.Control
          _checked={{
            bg: "primary.300",
          }}
          {...controlProps}
        >
          <Switch.Thumb />
        </Switch.Control>
        {!reversed && (
          <Switch.Label>
            {label || children}
            {required && <Field.RequiredIndicator />}
          </Switch.Label>
        )}
      </Switch.Root>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
};
