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
      px={".625rem"}
      w={"fit-content"}
      display="inline-flex"
      py="4px"
      rounded="md"
      alignItems="center"
      {...props}
    >
      <Text
        textStyle={"tiny-regular"}
        whiteSpace={"nowrap"}
        color={getColorFun()?.text}
        fontSize="12px"
        fontWeight="500"
        textTransform="capitalize"
      >
        {name}
      </Text>
    </Center>
  );
}
