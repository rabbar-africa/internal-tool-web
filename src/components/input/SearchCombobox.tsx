import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Combobox,
  Field,
  Flex,
  Portal,
  Spinner,
  Text,
  createListCollection,
} from "@chakra-ui/react";
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

/**
 * Searchable, type-or-select combobox built on Chakra v3's `Combobox` (Ark UI +
 * Floating UI). The library owns positioning, so the panel tracks the input and
 * flips/collides correctly — including on mobile with the virtual keyboard — and
 * `allowCustomValue` lets users keep a typed value that isn't in the list.
 *
 * The public props are unchanged from the previous hand-rolled version, so every
 * call site (invoice items, inspection findings/status, customer/vehicle, etc.)
 * works without edits.
 */
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
  const isInputControlled = inputValue !== undefined;
  const selectedOption = options.find((o) => o.value === value);

  // Display text: controlled by the parent when `inputValue` is passed,
  // otherwise tracked internally and kept in sync with the selected option.
  const [internalInput, setInternalInput] = useState(
    selectedOption?.label ?? "",
  );
  const inputText = isInputControlled ? (inputValue ?? "") : internalInput;

  useEffect(() => {
    if (!isInputControlled && selectedOption) {
      setInternalInput(selectedOption.label);
    }
    // Only resync when the resolved selection label changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInputControlled, selectedOption?.label]);

  // The current search query drives local filtering / the server-search call.
  // Reset to "" when the popup opens so reopening shows the full list again.
  const [query, setQuery] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const emitSearch = (q: string) => {
    if (!onSearchChange) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (searchDebounceMs > 0) {
      debounceTimerRef.current = setTimeout(
        () => onSearchChange(q),
        searchDebounceMs,
      );
    } else {
      onSearchChange(q);
    }
  };

  // Server search returns options already filtered by the backend; otherwise we
  // filter locally by label/subLabel against the typed query.
  const visibleOptions = useMemo(() => {
    if (serverSearch || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subLabel?.toLowerCase().includes(q) ?? false),
    );
  }, [serverSearch, query, options]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: visibleOptions,
        itemToString: (o) => o.label,
        itemToValue: (o) => o.value,
      }),
    [visibleOptions],
  );

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

      <Combobox.Root
        collection={collection}
        width="100%"
        openOnClick
        allowCustomValue
        selectionBehavior="replace"
        disabled={disabled}
        invalid={!!error}
        positioning={{ sameWidth: true, placement: "bottom-start", gutter: 4 }}
        // Only reflect a value that maps to a real option; typed custom values
        // live in the input text, not as a "selected" item.
        value={selectedOption ? [selectedOption.value] : []}
        inputValue={inputText}
        onOpenChange={(details) => {
          if (details.open) setQuery("");
        }}
        onInputValueChange={(details) => {
          if (!isInputControlled) setInternalInput(details.inputValue);
          // Fire onInputChange / server search only on actual typing — not on
          // selection-driven input updates.
          if (details.reason === "input-change") {
            setQuery(details.inputValue);
            onInputChange?.(details.inputValue);
            emitSearch(details.inputValue);
          }
        }}
        onValueChange={(details) => {
          const nextValue = details.value[0] ?? "";
          const option =
            options.find((o) => o.value === nextValue) ??
            visibleOptions.find((o) => o.value === nextValue);
          if (!isInputControlled) setInternalInput(option?.label ?? nextValue);
          setQuery("");
          if (onSearchChange) onSearchChange("");
          if (nextValue) {
            onChange(
              nextValue,
              option ?? { label: nextValue, value: nextValue },
            );
          }
        }}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder={placeholder}
            px="16px"
            h="2.5rem"
            color="gray.500"
            borderColor={error ? "error.300" : "gray.100"}
            _placeholder={{ textStyle: "tiny-regular", color: "gray.100" }}
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Portal>
          <Combobox.Positioner>
            <Combobox.Content
              maxH="260px"
              overflowY="auto"
              // Modal dialogs (ark/Radix) set body { pointer-events: none } while
              // open; ensure the popup stays interactive from inside a Dialog.
              pointerEvents="auto"
            >
              {isLoading ? (
                <Flex px="3" py="4" align="center" gap="2">
                  <Spinner size="sm" color="primary.400" />
                  <Text fontSize="13px" color="gray.300">
                    Searching...
                  </Text>
                </Flex>
              ) : (
                <>
                  <Combobox.Empty
                    px="3"
                    py="3"
                    fontSize="13px"
                    color="gray.300"
                  >
                    {emptyText}
                  </Combobox.Empty>
                  {visibleOptions.map((option) => (
                    <Combobox.Item
                      key={option.value}
                      item={option}
                      px="3"
                      py="2"
                      cursor="pointer"
                      _hover={{ bg: "primary.50" }}
                      _highlighted={{ bg: "primary.50" }}
                    >
                      <Box>
                        <Combobox.ItemText
                          fontSize="13px"
                          color="gray.500"
                          fontWeight={value === option.value ? "600" : "400"}
                        >
                          {option.label}
                        </Combobox.ItemText>
                        {option.subLabel && (
                          <Text fontSize="11px" color="gray.300" mt="0.5">
                            {option.subLabel}
                          </Text>
                        )}
                      </Box>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))}
                </>
              )}

              {!isLoading && footerAction && (
                <Combobox.Context>
                  {(api) => (
                    <Flex
                      position="sticky"
                      bottom="0"
                      bg="white"
                      borderTopWidth="1px"
                      borderColor="gray.75"
                      px="3"
                      py="2.5"
                      cursor="pointer"
                      align="center"
                      gap="1.5"
                      _hover={{ bg: "primary.50" }}
                      onClick={() => {
                        api.setOpen(false);
                        footerAction.onClick();
                      }}
                    >
                      <Text
                        fontSize="13px"
                        color="primary.400"
                        fontWeight="500"
                      >
                        + {footerAction.label}
                      </Text>
                    </Flex>
                  )}
                </Combobox.Context>
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>

      {error && (
        <Field.ErrorText mt=".25rem" fontSize=".625rem">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
