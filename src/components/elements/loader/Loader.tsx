import { Logo } from "@/components/common/Logo";
import { Box, Center, Spinner, Text, VisuallyHidden } from "@chakra-ui/react";

type Props = {
  text?: string;
};
export const LogoLoader = ({ text = "Loading..." }: Props) => {
  return (
    <Box role="status" w="full" h="full" overflow="hidden" inset={0}>
      <Center gap="4" h="full" w="full" flexDirection={"column"}>
        <Spinner size={"sm"} color="primary.100" />

        <Logo fontSize="8xl" h="max-content" />
        <Text fontSize={"xs"} fontWeight={"semibold"} color={"primary.100"}>
          {text}
        </Text>
      </Center>
      <VisuallyHidden>Loading...</VisuallyHidden>
    </Box>
  );
};
