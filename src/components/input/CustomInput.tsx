import { Field, Input, Box } from "@chakra-ui/react";
import type { CustomInputProps } from "@/shared/interface/input";

export function CustomInput({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  error,
  type = "text",
  leftElement,
  rightElement,
  register,
  labelProps,
  inputProps,
  ...props
}: CustomInputProps) {
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
          {required && <Field.RequiredIndicator color={"error.300"} mb={0} />}
        </Field.Label>
      )}
      <Box position="relative" w={"100%"}>
        {leftElement && (
          <Box
            position="absolute"
            left="16px"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
          >
            {leftElement}
          </Box>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          px="16px"
          pl={leftElement ? "48px" : undefined}
          pr={rightElement ? "48px" : undefined}
          borderColor={"gray.100"}
          h={"2.5rem"}
          color={"gray.500"}
          _placeholder={{
            textStyle: "tiny-regular",
            ...inputProps?._placeholder,
            color: "gray.100",
          }}
          {...register}
          {...props}
          {...inputProps}
        />
        {rightElement && (
          <Box
            position="absolute"
            right="16px"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
          >
            {rightElement}
          </Box>
        )}
      </Box>
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
}
