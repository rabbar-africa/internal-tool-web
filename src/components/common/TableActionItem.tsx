import { Flex, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";

export function TableActionItem({
  label,
  Icon,
}: {
  label: string;
  Icon?: ComponentType<any>;
}) {
  return (
    <Flex
      mx={".75rem"}
      py={".8rem"}
      minW={"16.1875rem"}
      cursor={"pointer"}
      alignItems={"center"}
      gap={"1rem"}
    >
      {Icon && <Icon width="1.375rem" />}{" "}
      <Text textStyle={"small-regular"}>{label}</Text>
    </Flex>
  );
}
