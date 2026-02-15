import type { CustomInputProps } from "@/shared/interface/input";
import { Field, InputGroup, Input } from "@chakra-ui/react";

export function CustomFileInput({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  register,
  labelProps,
  inputProps,
  ...props
}: Omit<CustomInputProps, "type" | "leftElement" | "rightElement">) {
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
      <InputGroup
        startAddon="Choose File"
        startAddonProps={{
          px: "1rem",
          textStyle: "tiny-regular",
          bg: "gray.50",
          border: "none",
        }}
      >
        <Input
          type="file"
          css={{
            "&::file-selector-button": {
              display: "none",
            },
          }}
          pl={"1rem"}
          pr={"1rem"}
          borderColor={"gray.50"}
          boxShadow={"none"}
          textStyle={"tiny-regular"}
          color={"gray.100"}
          display={"flex"}
          alignItems={"center"}
          pt={".5rem"}
          h={"2.5rem"}
          {...register}
          {...props}
          {...inputProps}
        />
      </InputGroup>
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
