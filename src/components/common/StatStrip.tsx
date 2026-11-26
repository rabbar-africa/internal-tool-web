import { Children, type ReactNode } from "react";
import { Box, Flex, Grid, Skeleton, Text } from "@chakra-ui/react";
import { CARD_SHADOW, FAINT_DIVIDER, FAINT_EDGE } from "@/theme/surfaces";

export interface StatCellProps {
  /** The little coloured dot before the label. */
  dot: string;
  label: string;
  value?: ReactNode;
  note?: ReactNode;
  /** Makes the cell a button, e.g. to open the list filtered to it. */
  onClick?: () => void;
  /** Says what a click does, for the tooltip and screen readers. */
  actionLabel?: string;
  /** Keeps the label; only the figure and note shimmer. */
  loading?: boolean;
}

/** One figure in a {@link StatStrip}. */
export function StatCell({
  dot,
  label,
  value,
  note,
  onClick,
  actionLabel,
  loading,
}: StatCellProps) {
  const clickable = Boolean(onClick) && !loading;
  return (
    <Box
      as={clickable ? "button" : "div"}
      onClick={clickable ? onClick : undefined}
      title={clickable ? actionLabel : undefined}
      aria-label={clickable && actionLabel ? actionLabel : undefined}
      textAlign="left"
      bg="white"
      px="5"
      py="4"
      minW="0"
      cursor={clickable ? "pointer" : "default"}
      transition="background .15s ease"
      _hover={clickable ? { bg: "gray.50" } : undefined}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "primary.200",
        outlineOffset: "-2px",
      }}
    >
      <Flex align="center" gap="2">
        <Box boxSize="7px" rounded="full" bg={dot} flexShrink={0} />
        <Text fontSize="13px" color="gray.300" truncate>
          {label}
        </Text>
      </Flex>
      {loading ? (
        <>
          <Skeleton h="1.75rem" w="7rem" mt="1.5" rounded="md" />
          {/* Same height as the note it stands in for: no jump. */}
          <Skeleton h="12px" w="5rem" mt="5px" mb="3px" rounded="sm" />
        </>
      ) : (
        <>
          <Text
            fontSize="22px"
            fontWeight="700"
            color="gray.500"
            mt="1"
            lineHeight="1.3"
            fontVariantNumeric="tabular-nums"
            truncate
          >
            {value}
          </Text>
          <Text fontSize="12px" color="gray.300" mt="0.5" truncate>
            {note ?? " "}
          </Text>
        </>
      )}
    </Box>
  );
}

/**
 * A row of figures above a list, in one soft card with hairlines between the
 * cells: two across on a phone, all of them in one row on a wide screen.
 */
export function StatStrip({ children }: { children: ReactNode }) {
  const count = Children.toArray(children).filter(Boolean).length;
  return (
    <Grid
      templateColumns={{
        base: "repeat(2, 1fr)",
        lg: `repeat(${count}, 1fr)`,
      }}
      // The gaps show the background through: hairlines between the cells.
      gap="1px"
      bg={FAINT_DIVIDER}
      rounded="18px"
      borderWidth="1px"
      borderColor={FAINT_EDGE}
      boxShadow={CARD_SHADOW}
      overflow="hidden"
    >
      {children}
    </Grid>
  );
}
