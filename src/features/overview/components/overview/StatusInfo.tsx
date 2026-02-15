import { Button, Flex, Separator, Text } from "@chakra-ui/react";

interface StatusInfoProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  isExpired: boolean;
}

export const StatusInfo: React.FC<StatusInfoProps> = ({
  icon,
  title,
  description,
  status,
  dueDate,
  isExpired,
}) => {
  return (
    <Flex flexDirection="column">
      <Separator borderColor="gray.50" my="16px" />
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        <Flex alignItems="center">
          <Flex
            boxSize="40px"
            borderRadius="10px"
            justifyContent="center"
            alignItems="center"
            bg="primary.50"
            marginRight="10px"
          >
            {icon}
          </Flex>
          <Flex flexDirection="column">
            <Text textStyle="small-semibold" color="black">
              {title}
            </Text>
            <Flex alignItems="center">
              <Text textStyle="tiny-regular" color="gray.200">
                {description}
              </Text>
              <Separator
                borderColor="gray.75"
                orientation="vertical"
                mx="10px"
                height="15px"
              />
              <Text
                textStyle="tiny-regular"
                color={isExpired ? "error.300" : "gray.200"}
              >
                {dueDate}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Button
          variant="outline"
          bg="secondary.50"
          border="none"
          textStyle="tiny-regular"
          color={status === "Completed" ? "success.300" : "gray.200"}
          height="36px"
          px="11.5px"
        >
          {status}
        </Button>
      </Flex>
    </Flex>
  );
};
