import React, { useState, useRef, useEffect } from "react";
import { Box, Field, Flex, Input, Portal, Text } from "@chakra-ui/react";
import type { FieldLabelProps } from "@chakra-ui/react";

export interface SearchComboboxOption {
  label: string;
  value: string;
  subLabel?: string;
}

export interface SearchComboboxProps {
  options: SearchComboboxOption[];
  value?: string;
  onChange: (value: string, option: SearchComboboxOption) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  footerAction?: {
    label: string;
    onClick: () => void;
  };
  emptyText?: string;
  labelProps?: FieldLabelProps;
  disabled?: boolean;
}

export function SearchCombobox({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  required,
  error,
  footerAction,
  emptyText = "No results found. Try a different keyword.",
  labelProps,
  disabled,
}: SearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.subLabel?.toLowerCase().includes(query.toLowerCase()) ?? false),
      )
    : options;

  const updatePosition = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideInput = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideInput && !insideDropdown) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    }
  };

  const handleFocus = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleSelect = (option: SearchComboboxOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    setQuery("");
  };

  const inputDisplayValue = isOpen ? query : (selectedOption?.label ?? "");

  return (
    <Field.Root
      gap={0}
      required={required}
      invalid={!!error}
      disabled={disabled}
    >
      {label && (
        <Field.Label
          mb=".625rem"
          textStyle="tiny-semibold"
          color="gray.300"
          {...labelProps}
        >
          {label}
          {required && <Field.RequiredIndicator color="error.300" mb={0} />}
        </Field.Label>
      )}
      <Box ref={containerRef} position="relative" w="100%">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputDisplayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          px="16px"
          borderColor={error ? "error.300" : "gray.100"}
          h="2.5rem"
          color="gray.500"
          disabled={disabled}
          _placeholder={{ textStyle: "tiny-regular", color: "gray.100" }}
        />
      </Box>

      {isOpen && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="fixed"
            top={`${dropdownPos.top}px`}
            left={`${dropdownPos.left}px`}
            w={`${dropdownPos.width}px`}
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            rounded="md"
            shadow="lg"
            zIndex={1400}
            maxH="260px"
            overflowY="auto"
          >
            {filtered.length === 0 ? (
              <Box px="3" py="3">
                <Text fontSize="13px" color="gray.300">
                  {emptyText}
                </Text>
              </Box>
            ) : (
              filtered.map((option) => (
                <Box
                  key={option.value}
                  px="3"
                  py="2"
                  cursor="pointer"
                  bg={value === option.value ? "primary.50" : "white"}
                  _hover={{ bg: "primary.50" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(option);
                  }}
                >
                  <Text
                    fontSize="13px"
                    color="gray.500"
                    fontWeight={value === option.value ? "600" : "400"}
                  >
                    {option.label}
                  </Text>
                  {option.subLabel && (
                    <Text fontSize="11px" color="gray.300" mt="0.5">
                      {option.subLabel}
                    </Text>
                  )}
                </Box>
              ))
            )}

            {footerAction && (
              <Flex
                borderTopWidth="1px"
                borderColor="gray.75"
                px="3"
                py="2.5"
                cursor="pointer"
                align="center"
                gap="1.5"
                _hover={{ bg: "primary.50" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setQuery("");
                  footerAction.onClick();
                }}
              >
                <Text fontSize="13px" color="primary.400" fontWeight="500">
                  + {footerAction.label}
                </Text>
              </Flex>
            )}
          </Box>
        </Portal>
      )}

      {error && (
        <Field.ErrorText mt=".25rem" fontSize=".625rem">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
