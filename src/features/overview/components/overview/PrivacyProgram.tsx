import { Button, Flex, Separator, Text } from "@chakra-ui/react";
import { MaturityBars } from "./MaturityBars";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";

export const PrivacyProgram: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Flex
      bg="white"
      p="30px"
      width="100%"
      borderRadius="10px"
      flexDirection="column"
    >
      <Flex align="center" justify="space-between" width="100%">
        <Text textStyle="default-semibold">Pending Tasks</Text>
        <Button
          variant="outline"
          _hover={{
            bg: "transparent",
          }}
          border="none"
          color="primary"
          height="36px"
          fontSize="12px"
          fontWeight={400}
          width="112px"
          onClick={() => navigate(RouteConstants.overview.base.path)}
        >
          View Report
        </Button>
      </Flex>
      <Separator borderColor="gray.50" my="18px" />
      <Flex width="100%" justifyContent="center">
        <MaturityBars />
      </Flex>
    </Flex>
  );
};
