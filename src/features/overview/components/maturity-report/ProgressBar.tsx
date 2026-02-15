import { Flex, Text, Progress } from "@chakra-ui/react";

interface ProgressBarProps {
  text: string;
  value: number;
  color?: string;
  description?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  text,
  value,
  color,
  description,
}) => {
  return (
    <Flex direction="column">
      <Flex width="100%" align="center" justify="space-between" mb="4px">
        <Text textStyle="tiny-regular">{text}</Text>
        <Text textStyle="tiny-bold">{description}</Text>
      </Flex>
      <Progress.Root width="100%" value={value}>
        <Progress.Track bg="gray.50" borderRadius="20px">
          <Progress.Range bg={color} />
        </Progress.Track>
      </Progress.Root>
    </Flex>
  );
};
