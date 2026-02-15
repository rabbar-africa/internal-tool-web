"use client";
import { Field, Input, Box, Flex, Text } from "@chakra-ui/react";
import { useState, type KeyboardEvent } from "react";
import type { CustomInputProps } from "@/shared/interface/input";
import { XIcon } from "@/assets/custom";

interface MultiValueInputProps extends Omit<
  CustomInputProps,
  "register" | "type"
> {
  register?: {
    name: string;
    onChange: (value: string[]) => void;
    onBlur?: () => void;
    value?: string[];
  };
  validateItem?: (value: string) => string | undefined; // Returns error message or undefined
  duplicateMessage?: string;
  emptyMessage?: string;
}

export function MultiValueInput({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  error,
  leftElement,
  rightElement,
  register,
  validateItem,
  duplicateMessage = "This value already exists",
  emptyMessage = "Value cannot be empty",
  ...props
}: MultiValueInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  const values = register?.value || [];

  const validateAndAddValue = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setInputError(emptyMessage);
      return;
    }

    if (values.includes(trimmedValue)) {
      setInputError(duplicateMessage);
      return;
    }

    if (validateItem) {
      const validationError = validateItem(trimmedValue);
      if (validationError) {
        setInputError(validationError);
        return;
      }
    }

    // Add the value
    const newValues = [...values, trimmedValue];
    register?.onChange(newValues);
    setInputValue("");
    setInputError(undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndAddValue(inputValue);
    }
  };

  const removeValue = (indexToRemove: number) => {
    const newValues = values.filter((_, index) => index !== indexToRemove);
    register?.onChange(newValues);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setInputError(undefined); // Clear error when user starts typing
  };

  return (
    <Field.Root
      gap={0}
      required={required}
      invalid={!!(error || inputError)}
      disabled={disabled}
    >
      {label && (
        <Field.Label
          mb={".625rem"}
          textStyle={"tiny-semibold"}
          color={"gray.300"}
        >
          {label}
          {required && <Field.RequiredIndicator color={"error.300"} mb={0} />}
        </Field.Label>
      )}

      {/* Tags Display */}
      {values.length > 0 && (
        <Flex mb={".625rem"} gap={2} flexWrap="wrap" align="center">
          {values.map((value, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={1}
              bg="gray.100"
              borderRadius="md"
              px={2}
              py={1}
              border="1px solid"
              borderColor="gray.200"
            >
              <Text textStyle="tiny-regular" color="gray.700">
                {value}
              </Text>
              <XIcon onClick={() => removeValue(index)} />
              {/* <IconButton
                size="xs"
                variant="ghost"
                colorScheme="gray"
                aria-label={`Remove ${value}`}
                icon={<XIcon/>}
                disabled={disabled}
                minW="auto"
                h="auto"
                p={0}
                _hover={{ bg: 'gray.200' }}
              /> */}
            </Box>
          ))}
        </Flex>
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
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={register?.onBlur}
          px="16px"
          pl={leftElement ? "48px" : undefined}
          pr={rightElement ? "48px" : undefined}
          borderColor={"gray.50"}
          h={"2.5rem"}
          disabled={disabled}
          _placeholder={{
            textStyle: "tiny-regular",
          }}
          {...props}
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

      {/* Error Messages */}
      {(error || inputError) && (
        <Field.ErrorText fontSize={".615rem"} mt={".25rem"}>
          {error || inputError}
        </Field.ErrorText>
      )}

      {/* Helper Text */}
      {helperText && !error && !inputError && (
        <Field.HelperText fontSize={".615rem"} color={"gray.200"} mt={".25rem"}>
          {helperText}
        </Field.HelperText>
      )}
    </Field.Root>
  );
}
