import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Field,
  Flex,
  Input,
  Portal,
  Spinner,
  Text,
} from "@chakra-ui/react";
import type { FieldLabelProps } from "@chakra-ui/react";

export interface SearchComboboxOption {
  label: string;
  value: string;
  subLabel?: string;
}

// Ceiling for the dropdown height; the actual height shrinks to fit the space
// available above/below the input so the panel never runs off-screen.
const DROPDOWN_MAX_HEIGHT = 260;
// Gap between the input and the dropdown, and the min space it needs below the
// input before it flips to open upward instead.
const DROPDOWN_GAP = 4;

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
  /** Called when the search query changes. Use with serverSearch=true for backend search. */
  onSearchChange?: (query: string) => void;
  /** Debounce delay in ms for onSearchChange. Defaults to 0. */
  searchDebounceMs?: number;
  /** When true, skips local filtering and uses options as-is (for server-side search). */
  serverSearch?: boolean;
  /** Shows a loading spinner inside the dropdown when true. */
  isLoading?: boolean;
  /** Controlled input text. When provided, the combobox displays this when no option is selected. */
  inputValue?: string;
  /** Fires only on user typing (not on selection-driven clears). */
  onInputChange?: (text: string) => void;
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
  onSearchChange,
  searchDebounceMs = 0,
  serverSearch = false,
  isLoading = false,
  inputValue,
  onInputChange,
}: SearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");
  const isInputControlled = inputValue !== undefined;
  const query = isInputControlled ? inputValue : internalQuery;
  const setQuery = (val: string) => {
    if (!isInputControlled) setInternalQuery(val);
  };
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    maxHeight: DROPDOWN_MAX_HEIGHT,
    openUp: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when the footer action opens an external modal; suppresses the focus
  // event the modal fires back at the input on close so the dropdown doesn't
  // reopen over a freshly selected value.
  const ignoreNextFocusRef = useRef(false);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = serverSearch
    ? options
    : query.trim()
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            (o.subLabel?.toLowerCase().includes(query.toLowerCase()) ?? false),
        )
      : options;

  const updatePosition = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP;
    const spaceAbove = rect.top - DROPDOWN_GAP;
    // Flip upward only when the space below can't fit the dropdown AND there's
    // genuinely more room above — otherwise keep it below the input.
    const openUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      120,
      Math.min(DROPDOWN_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
    );
    setDropdownPos({
      top: rect.bottom + DROPDOWN_GAP,
      // Distance from the viewport bottom to the input's top — used when the
      // panel opens upward so it grows from the input, not the screen edge.
      bottom: window.innerHeight - rect.top + DROPDOWN_GAP,
      left: rect.left,
      width: rect.width,
      maxHeight,
      openUp,
    });
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideInput = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideInput && !insideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // While open, keep the fixed-position dropdown anchored to the input as the
  // page (or any scroll container) scrolls or the window resizes. Without this
  // the panel stays frozen at its original spot and appears to float loose.
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => updatePosition();
    // `true` = capture phase, so scrolls inside nested scroll containers count.
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onInputChange?.(newQuery);
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    }
    if (onSearchChange) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (searchDebounceMs > 0) {
        debounceTimerRef.current = setTimeout(() => {
          onSearchChange(newQuery);
        }, searchDebounceMs);
      } else {
        onSearchChange(newQuery);
      }
    }
  };

  const handleFocus = () => {
    if (ignoreNextFocusRef.current) {
      ignoreNextFocusRef.current = false;
      return;
    }
    updatePosition();
    setIsOpen(true);
  };

  const handleSelect = (option: SearchComboboxOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    setQuery("");
    if (onSearchChange) onSearchChange("");
  };

  const inputDisplayValue = isOpen ? query : (selectedOption?.label ?? query);

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
            top={dropdownPos.openUp ? undefined : `${dropdownPos.top}px`}
            bottom={dropdownPos.openUp ? `${dropdownPos.bottom}px` : undefined}
            left={`${dropdownPos.left}px`}
            w={`${dropdownPos.width}px`}
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            rounded="md"
            shadow="lg"
            zIndex="popover"
            // Modal dialogs (ark/Radix) set body { pointer-events: none } while
            // open; this portalled dropdown lives on <body>, so re-enable it or
            // its options can't be clicked from inside a Dialog.
            pointerEvents="auto"
            maxH={`${dropdownPos.maxHeight}px`}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Box flex="1" overflowY="auto">
              {isLoading ? (
                <Flex px="3" py="4" align="center" gap="2">
                  <Spinner size="sm" color="primary.400" />
                  <Text fontSize="13px" color="gray.300">
                    Searching...
                  </Text>
                </Flex>
              ) : filtered.length === 0 ? (
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
            </Box>

            {!isLoading && footerAction && (
              <Flex
                flexShrink={0}
                bg="white"
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
                  ignoreNextFocusRef.current = true;
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
