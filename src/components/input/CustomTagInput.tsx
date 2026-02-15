"use client";
import React, { useEffect, useState } from "react";
import { Field, Input, Tag, HStack, Box } from "@chakra-ui/react";
import type { CustomTagInputProps } from "@/shared/interface/input";

export const CustomTagInput: React.FC<CustomTagInputProps> = ({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  value: externalValue = [],
  onChange,
  register,
  setValue,
  name,
  placeholder = "Add email address and press Enter",
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");
  const [internalValue, setInternalValue] = useState<string[]>(externalValue);

  useEffect(() => {
    setInternalValue(externalValue);
    if (setValue && name) {
      setValue(name, externalValue.join(","), { shouldValidate: true });
    }
  }, [externalValue, name, setValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!internalValue.includes(trimmed)) {
        const newValue = [...internalValue, trimmed];
        setInternalValue(newValue);
        setInputValue("");
        onChange?.(newValue);

        if (setValue && name) {
          setValue(name, newValue.join(","), { shouldValidate: true });
        }
        register?.onChange?.({
          target: {
            name: register.name,
            value: newValue.join(","),
            type: "text",
          },
        });
      }
    }
  };

  const handleRemove = (tag: string) => {
    const newValue = internalValue.filter((t) => t !== tag);
    setInternalValue(newValue);
    onChange?.(newValue);

    if (setValue && name) {
      setValue(name, newValue.join(","), { shouldValidate: true });
    }
    register?.onChange?.({
      target: {
        name: register.name,
        value: newValue.join(","),
        type: "text",
      },
    });
  };

  return (
    <Field.Root required={required} invalid={!!error} disabled={disabled}>
      {label && <Field.Label>{label}</Field.Label>}
      <Box
        px="16px"
        py="10px"
        borderWidth="1px"
        borderRadius="10px"
        borderColor={error ? "error.500" : "gray.50"}
        _focusWithin={{ borderColor: "gray.50" }}
        width="100%"
      >
        <HStack gap={2} wrap="wrap">
          {internalValue.map((tag) => (
            <Tag.Root
              key={tag}
              size="md"
              variant="solid"
              p="6px"
              bg="primary.50"
              borderRadius="30px"
            >
              <Tag.Label textStyle="tiny-regular" color="primary">
                {tag}
              </Tag.Label>
              {!disabled && (
                <Tag.EndElement>
                  <Tag.CloseTrigger
                    cursor="pointer"
                    color="primary.300"
                    onClick={() => handleRemove(tag)}
                  />
                </Tag.EndElement>
              )}
            </Tag.Root>
          ))}

          <Input
            border="none"
            borderRadius="0"
            p="0"
            value={inputValue}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            fontSize="16px"
            height="19px"
            boxShadow="none"
            outline="none"
            _placeholder={{
              fontSize: "12px",
              color: "gray.75",
              fontWeight: "400",
            }}
            {...(register
              ? {
                  name: register.name,
                  onBlur: register.onBlur,
                  ref: register.ref,
                }
              : {})}
            {...props}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </HStack>
      </Box>

      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
};
