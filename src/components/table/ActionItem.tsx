import { Flex, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";

export function ActionItem({
  label,
  Icon,
}: {
  label: string;
  Icon: ComponentType<any>;
}) {
  return (
    <Flex
      mx={".75rem"}
      pl={"2.5rem"}
      py={".8rem"}
      minW={"16.1875rem"}
      cursor={"pointer"}
      alignItems={"center"}
      gap={"1rem"}
    >
      <Icon width="1.375rem" />
      <Text textStyle={"small-regular"}>{label}</Text>
    </Flex>
  );
}
