import { getStatusColor } from "@/utils/get-color";
import { Center, Text, type BoxProps } from "@chakra-ui/react";
import { useCallback } from "react";

export default function Status({
  name,
  ...props
}: { name?: string } & BoxProps) {
  const getColorFun = useCallback(() => getStatusColor(name || ""), [name]);
  return (
    <Center
      bg={getColorFun()?.bg}
      rounded={".625rem"}
      px={".625rem"}
      py={".375rem"}
      w={"fit-content"}
      {...props}
    >
      <Text
        textStyle={"tiny-regular"}
        whiteSpace={"nowrap"}
        color={getColorFun()?.text}
      >
        {name}
      </Text>
    </Center>
  );
}
