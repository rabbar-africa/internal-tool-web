import { Box, Skeleton, Stack } from "@chakra-ui/react";

interface CardSkeletonProps {
  count?: number;
  width?: string | number;
  height?: string | number;
  gap?: string | number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  width = "100%",
  height = "180px",
  gap = 4,
}) => {
  return (
    <Stack direction="row" gap={gap} w="100%">
      {Array.from({ length: count }).map((_, idx) => (
        <Box key={idx} width={width} height={height}>
          <Skeleton height="100%" width="100%" borderRadius="md" bg="gray.50" />
        </Box>
      ))}
    </Stack>
  );
};

export default CardSkeleton;
