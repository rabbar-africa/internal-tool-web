"use client";

import React, { useState, useCallback } from "react";
import { Field, Input, Box, Spinner, InputGroup } from "@chakra-ui/react";
import type { FieldRootProps, InputProps } from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@/assets/custom";

export interface SearchInputProps extends Omit<
  InputProps,
  "onChange" | "value"
> {
  // Field-related props
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;

  // Search-specific props
  value?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  onClear?: () => void;

  // Behavior props
  clearable?: boolean;
  searchOnType?: boolean;
  debounceMs?: number;
  loading?: boolean;

  // Visual props
  searchIcon?: React.ReactElement;
  clearIcon?: React.ReactElement;
  showFilterButton?: boolean;
  onFilterClick?: () => void;

  // Layout props
  width?: string | number;
  maxWidth?: string | number;

  // Field container props
  fieldProps?: FieldRootProps;

  // Accessibility
  searchButtonLabel?: string;
  clearButtonLabel?: string;
  filterButtonLabel?: string;
}

export function SearchInput({
  // Field props
  label,
  helperText,
  error,
  required = false,
  fieldProps,

  // Search props
  value = "",
  onSearch,
  onChange,

  // Behavior props
  searchOnType = true,
  debounceMs = 300,
  loading = false,

  // Visual props
  searchIcon,

  // Layout props
  width = "21rem",
  // Input props
  placeholder = "Search...",
  disabled = false,
  ...inputProps
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<any>(null);

  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;
  const setValue = value !== undefined ? onChange : setInternalValue;

  // Debounced search handler
  const handleDebouncedSearch = useCallback(
    (searchValue: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch?.(searchValue);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceTimer, debounceMs, onSearch],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue?.(newValue);

    if (searchOnType && onSearch) {
      handleDebouncedSearch(newValue);
    }
  };

  // Handle key press (Enter to search)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch && !searchOnType) {
      onSearch(currentValue);
    }
    inputProps.onKeyDown?.(e);
  };

  // Handle clear
  //   const handleClear = () => {
  //     setValue?.('')
  //     onClear?.()
  //     if (searchOnType && onSearch) {
  //       onSearch('')
  //     }
  //   }

  //   // Handle manual search (for non-searchOnType mode)
  //   const handleManualSearch = () => {
  //     if (onSearch) {
  //       onSearch(currentValue)
  //     }
  //   }

  // Clean up debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const searchIconElement = searchIcon || (
    <MagnifyingGlassIcon color={"gray.200"} ml={"1.125rem"} w={"1.19rem"} />
  );

  //   const showClearButton = clearable && currentValue.length > 0 && !loading
  //   const showSearchButton = !searchOnType && onSearch

  const inputElement = (
    <Box position="relative">
      {/* Input field */}
      <InputGroup
        startElement={loading ? <Spinner size="sm" /> : searchIconElement}
        startOffset={"-.65rem"}
      >
        <Input
          id="search-input"
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          borderColor={"gray.100 !important"}
          outline={"none !important"}
          boxShadow={"none !important"}
          width={width}
          color={"gray.300"}
          _hover={{ borderColor: "gray.50" }}
          _focus={{
            borderColor: "primary.50",
          }}
          pr={".875rem"}
          pl={"475rem"}
          disabled={disabled || loading}
          _placeholder={{
            color: "gray.200",
            fontSize: "0.75rem",
          }}
          height={"2.5rem"}
          {...inputProps}
        />
      </InputGroup>

      {/* Right side buttons */}
      {/* {(showClearButton || showSearchButton || showFilterButton) && (
        <HStack
          position="absolute"
          right="8px"
          top="50%"
          transform="translateY(-50%)"
          gap={1}
          zIndex={1}
        >
          Clear button  
          {showClearButton && (
            <IconButton
              aria-label={clearButtonLabel}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={handleClear}
              _hover={{ bg: 'gray.100' }}
            />
          )}

         Manual search button (only when searchOnType is false)  
          {showSearchButton && (
            <IconButton
              aria-label={searchButtonLabel}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={handleManualSearch}
              disabled={loading}
              _hover={{ bg: 'blue.50' }}
            />
          )}

           Filter button  
          {showFilterButton && (
            <IconButton
              aria-label={filterButtonLabel}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={onFilterClick}
              _hover={{ bg: 'gray.100' }}
            />
          )}
        </HStack>
      )} */}
    </Box>
  );

  // If no label, helper text, or error, return just the input
  if (!label && !helperText && !error) {
    return inputElement;
  }

  // Otherwise, wrap in Field for proper form integration
  return (
    <Field.Root
      required={required}
      invalid={!!error}
      disabled={disabled || loading}
      {...fieldProps}
    >
      {label && (
        <Field.Label mb="0.5rem">
          {label}
          {required && <Field.RequiredIndicator color="red.500" />}
        </Field.Label>
      )}

      {inputElement}

      {error && <Field.ErrorText mt="0.5rem">{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText mt="0.5rem">{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
}

SearchInput.displayName = "SearchInput";

// Usage examples and presets
export const SearchInputPresets = {
  // Compact search for nav bars
  compact: {
    size: "md" as const,
    width: "16rem",
    placeholder: "Search...",
    searchOnType: true,
    clearable: true,
  },

  // Full-featured search for data tables
  dataTable: {
    size: "2xl" as const,
    width: "24rem",
    placeholder: "Search records...",
    searchOnType: true,
    clearable: true,
    showFilterButton: true,
    debounceMs: 500,
  },

  // Simple search for forms
  form: {
    size: "lg" as const,
    width: "100%",
    searchOnType: false,
    clearable: true,
  },

  // Instant search for autocomplete
  instant: {
    size: "lg" as const,
    width: "20rem",
    searchOnType: true,
    clearable: true,
    debounceMs: 150,
  },
} as const;
