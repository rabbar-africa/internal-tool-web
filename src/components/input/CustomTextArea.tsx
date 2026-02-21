import type { CustomTextareaProps } from "@/shared/interface/input";
import React from "react";
import { Field, Textarea } from "@chakra-ui/react";

export const CustomTextArea: React.FC<CustomTextareaProps> = ({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  variant = "outline",
  size = "md",
  error,
  rows = 4,
  resize = "vertical",
  register,
  labelProps,
  textAreaProps,
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
          {required && <Field.RequiredIndicator color={"error.300"} />}
        </Field.Label>
      )}
      <Textarea
        placeholder={placeholder}
        variant={variant}
        borderColor={"gray.50"}
        rounded={".625rem"}
        size={size}
        rows={rows}
        color={"gray.300"}
        resize={resize}
        p="16px"
        {...register}
        {...props}
        {...textAreaProps}
      />
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
