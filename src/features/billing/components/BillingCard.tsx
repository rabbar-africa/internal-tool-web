import type { ReactNode } from "react";
import { Box, Flex, Text, type BoxProps } from "@chakra-ui/react";
import { InfoIcon } from "@/assets/custom/InfoIcon";
import { Tooltip } from "@/components/elements/tooltip";

interface BillingCardProps extends Omit<BoxProps, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** On the right of the title: a toggle, a button. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * One section of Plan & Billing: a white card, its title over a divider, then
 * the body. Children lay out their own padding (`CardBody`), so a table can
 * run edge to edge.
 */
export function BillingCard({
  title,
  subtitle,
  action,
  children,
  ...props
}: BillingCardProps) {
  return (
    <Box
      as="section"
      bg="white"
      rounded="2xl"
      borderWidth="1px"
      borderColor="gray.75"
      overflow="hidden"
      minW={0}
      {...props}
    >
      {(title || action) && (
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
          px={{ base: "4", md: "6" }}
          py="5"
          borderBottomWidth="1px"
          borderColor="gray.75"
        >
          <Box>
            {title && (
              <Text fontSize="16px" fontWeight="700" color="gray.500">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text fontSize="14px" color="gray.300" mt="1">
                {subtitle}
              </Text>
            )}
          </Box>
          {action}
        </Flex>
      )}
      {children}
    </Box>
  );
}

/** The padded part of a BillingCard. */
export function CardBody({ children, ...props }: BoxProps) {
  return (
    <Box px={{ base: "4", md: "6" }} py="5" {...props}>
      {children}
    </Box>
  );
}

/** A thin progress bar; `percent` is clamped to 0–100. */
export function MeterBar({
  percent,
  color = "success.300",
  h = "6px",
}: {
  percent: number;
  color?: string;
  h?: string;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <Box
      h={h}
      rounded="full"
      bg="gray.75"
      overflow="hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <Box
        h="100%"
        w={`${width}%`}
        minW={width > 0 ? "6px" : 0}
        rounded="full"
        bg={color}
        transition="width .4s ease"
      />
    </Box>
  );
}

/**
 * A small (i) that explains the thing beside it on hover, or on tap/focus,
 * since a phone has no hover.
 */
export function InfoTip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip
      openDelay={100}
      closeOnClick={false}
      positioning={{ placement: "top" }}
      showArrow
      content={
        <Box maxW="18rem" color="gray.500" fontSize="13px" lineHeight="1.55">
          {children}
        </Box>
      }
      contentProps={{ shadow: "md" }}
    >
      <Box
        as="button"
        aria-label={label}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="1.5rem"
        rounded="full"
        color="gray.300"
        cursor="help"
        _hover={{ color: "primary.300" }}
        flexShrink={0}
      >
        <InfoIcon boxSize="1rem" />
      </Box>
    </Tooltip>
  );
}

/** Scrolls to the plan cards (the "Plans" card has `id="plans"`). */
export const scrollToPlans = () =>
  document
    .getElementById("plans")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
