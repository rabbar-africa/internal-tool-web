import React from "react";
import { Icon, HStack, VStack, RadioCard, Flex, Field } from "@chakra-ui/react";
import type { CustomRadioGroupProps } from "@/shared/interface/input";

export const CustomRadioCard: React.FC<CustomRadioGroupProps> = ({
  label,
  helperText,
  required = false,
  disabled = false,
  error,
  register,
  items = [],
  itemProps,
  labelProps,
  direction = "row",
  ...props
}) => {
  const Stack = direction === "row" ? HStack : VStack;

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
      <RadioCard.Root
        disabled={disabled}
        {...register}
        {...props}
        variant="outline"
      >
        <Stack gap="18px">
          {items.map((item: any) => {
            const IconComponent = item.icon;
            return (
              <RadioCard.Item
                key={item.value}
                value={item.value}
                py="10px"
                px="16px"
                cursor="pointer"
                borderRadius="10px"
                border="1px solid"
                borderColor="gray.50"
                bg="transparent"
                boxShadow="none"
                _checked={{
                  borderColor: "primary",
                  color: "primary",
                }}
                {...itemProps}
              >
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <Flex alignItems="center">
                    {IconComponent && (
                      <Icon
                        bg="primary.50"
                        boxSize="40px"
                        p="8px"
                        borderRadius="50%"
                      >
                        <IconComponent width="24px" height="24px" />
                      </Icon>
                    )}
                    <RadioCard.Label ml="16px">
                      {item.title || ""}
                    </RadioCard.Label>
                    {item.description && (
                      <RadioCard.ItemDescription>
                        {item.description}
                      </RadioCard.ItemDescription>
                    )}
                  </Flex>
                </RadioCard.ItemControl>
              </RadioCard.Item>
            );
          })}
        </Stack>
      </RadioCard.Root>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
    </Field.Root>
  );
};
