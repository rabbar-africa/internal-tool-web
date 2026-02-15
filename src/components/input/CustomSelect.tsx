import {
  Field,
  Portal,
  Select,
  createListCollection,
  Spinner,
  Center,
  Box,
  Text,
} from "@chakra-ui/react";
import type { CustomSelectProps } from "@/shared/interface/input";

export function CustomSelect({
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  error,
  options,
  emptyText = "Select an option",
  noOptionsText = "No options",
  loading = false,
  register,
  controlProps,
  itemProps,
  contentProps,
  value,
  onChange,
  labelProps,
  rootProps,
  multiple = false,
  ...props
}: CustomSelectProps) {
  const collection = createListCollection({
    items: options || [],
  });

  // Handle onChange for both controlled and react-hook-form scenarios
  const handleChange = (selectedValue: any) => {
    if (onChange) {
      if (multiple) {
        onChange(selectedValue?.value);
      } else {
        onChange(selectedValue || null);
      }
      return;
    }

    if (register?.onChange && "onChange" in register) {
      register.onChange({
        target: { name: register.name, value: selectedValue },
      });
    }
  };

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
      <Select.Root
        multiple={multiple}
        onValueChange={handleChange}
        value={value || (multiple ? [] : undefined)}
        {...register}
        {...props}
        {...rootProps}
        collection={collection}
        disabled={disabled && !loading}
      >
        <Select.Control w={"100%"} {...controlProps}>
          <Select.HiddenSelect />

          <Select.Trigger
            pl={"1rem"}
            rounded={".625rem"}
            border="1px solid #E9E7E6"
            borderColor={"gray.100"}
          >
            <Select.ValueText placeholder={placeholder || emptyText} />
          </Select.Trigger>

          <Select.IndicatorGroup pr={".85rem"}>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content bg={"white"} {...contentProps}>
              {loading ? (
                <Box px={".75rem"} py={"1rem"}>
                  <Center>
                    <Spinner size="sm" color="gray.400" mr={2} />
                    <Text textStyle="tiny-regular" color="gray.400">
                      Loading...
                    </Text>
                  </Center>
                </Box>
              ) : collection.items.length > 0 ? (
                collection.items.map((option: any) => (
                  <Select.Item
                    px={".5rem"}
                    key={option.label}
                    item={option.value}
                    py={".5rem"}
                    {...itemProps}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    {multiple && <Select.ItemIndicator />}
                  </Select.Item>
                ))
              ) : (
                <Box px={".75rem"} py={"1rem"}>
                  <Text textStyle="tiny-regular" color="gray.400">
                    {noOptionsText}
                  </Text>
                </Box>
              )}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
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
