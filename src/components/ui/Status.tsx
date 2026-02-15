import { getStatusColor } from "@/utils/get-color";
import { type BoxProps, Center } from "@chakra-ui/react";
import React, { useCallback } from "react";

export default function Status({
  name,
  ...props
}: { name?: string } & BoxProps) {
  const getColorFun = useCallback(() => getStatusColor(name || ""), [name]);
  return (
    <Center
      bg={getColorFun()?.bg}
      rounded={"12.5rem"}
      w={"5.625rem"}
      h={"2rem"}
      fontWeight={600}
      fontSize={".625rem"}
      color={getColorFun()?.text}
      textTransform={"uppercase"}
      {...props}
    >
      {name}
    </Center>
  );
}
