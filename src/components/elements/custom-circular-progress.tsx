import { Box, Flex } from "@chakra-ui/react";

interface CustomCircularProgressProps {
  value: number;
  size?: string;
  strokeWidth?: string;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
  strokeLinecap?: string;
}

export const CustomCircularProgress = ({
  value,
  size = "180px",
  strokeWidth = "5px",
  trackColor = "#EBEBEB",
  progressColor = "#4033FF",
  children,
}: CustomCircularProgressProps) => {
  const strokeWidthNum = parseInt(strokeWidth);
  const radius = 50 - strokeWidthNum / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Box
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      position="relative"
      width={size}
      height={size}
      minWidth={size}
      minHeight={size}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 100 100`}
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidthNum}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          transform="rotate(-90 50 50)"
          stroke={progressColor}
          strokeWidth={strokeWidthNum}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        {children}
      </Flex>
    </Box>
  );
};
