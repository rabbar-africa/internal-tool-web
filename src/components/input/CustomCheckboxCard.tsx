import React from "react";
import {
  Icon,
  HStack,
  VStack,
  CheckboxCard,
  Fieldset,
  CheckboxGroup,
  Flex,
} from "@chakra-ui/react";
import type { CustomCheckboxCardProps } from "@/shared/interface/input";

export const CustomCheckboxCard: React.FC<CustomCheckboxCardProps> = ({
  label,
  helperText,
  disabled = false,
  direction = "row",
  error,
  items,
}) => {
  const Stack = direction === "row" ? HStack : VStack;

  return (
    <Fieldset.Root invalid={!!error} disabled={disabled}>
      {label && <Fieldset.Legend>{label}</Fieldset.Legend>}

      <CheckboxGroup name="checkbox-group" defaultValue={[items[0].value]}>
        <Fieldset.Content>
          <Stack gap="18px">
            {items.map((item) => {
              const IconComponent = item.icon;
              return (
                <CheckboxCard.Root
                  key={item.value}
                  value={item.value}
                  py="10px"
                  px="16px"
                  cursor="pointer"
                  borderRadius="10px"
                  border="1px solid"
                  minW="119px"
                  borderColor="gray.50"
                  boxShadow="none"
                  _checked={{
                    borderColor: "primary",
                    color: "primary",
                  }}
                >
                  <CheckboxCard.HiddenInput />
                  <CheckboxCard.Control>
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
                      <CheckboxCard.Label ml="16px">
                        {item.label}
                      </CheckboxCard.Label>
                      {item.description && (
                        <CheckboxCard.Description>
                          {item.description}
                        </CheckboxCard.Description>
                      )}
                    </Flex>
                  </CheckboxCard.Control>
                </CheckboxCard.Root>
              );
            })}
          </Stack>
        </Fieldset.Content>
      </CheckboxGroup>

      {error && <Fieldset.ErrorText>{error}</Fieldset.ErrorText>}
      {helperText && !error && (
        <Fieldset.HelperText>{helperText}</Fieldset.HelperText>
      )}
    </Fieldset.Root>
  );
};
