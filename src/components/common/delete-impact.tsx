import type { ReactNode } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Pieces shared by the "what deleting this touches" modals (job cards,
 * customers, merging). The API says what is allowed; these only show it.
 */

/** "2 vehicles", or null when there are none. */
export const countOf = (n: number, one: string, many: string) =>
  n > 0 ? `${n.toLocaleString()} ${n === 1 ? one : many}` : null;

/** "a, b and c", leaving out the nulls. */
export const listOf = (parts: Array<string | null | false | undefined>) => {
  const items = parts.filter(Boolean) as string[];
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

export const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const TONES = {
  error: { bg: "error.50", title: "error.300" },
  warning: { bg: "warning.50", title: "warning.300" },
  gray: { bg: "gray.25", title: "gray.500" },
} as const;

/** A titled box saying what happens to one kind of record. */
export function ImpactBox({
  title,
  tone = "gray",
  children,
}: {
  title: string;
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  const colors = TONES[tone];
  return (
    <Box bg={colors.bg} rounded="lg" px="4" py="3">
      <Text textStyle="small-semibold" color={colors.title}>
        {title}
      </Text>
      <Box textStyle="small-regular" color="gray.500" mt="1">
        {children}
      </Box>
    </Box>
  );
}

/** A record number that opens the record. */
export function RecordLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      asChild
      fontWeight="600"
      color="primary.400"
      textDecoration="underline"
      textUnderlineOffset="2px"
    >
      <RouterLink to={to}>{children}</RouterLink>
    </Link>
  );
}

/** An optional extra to delete, with what happens either way underneath. */
export function TickOption({
  label,
  checked,
  onChange,
  disabled,
  disabledHint,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** No permission: shown, but can't be ticked. */
  disabled?: boolean;
  disabledHint?: string;
  hint: string;
}) {
  return (
    <Stack gap="1" borderWidth="1px" borderColor="gray.100" rounded="md" p="3">
      <Checkbox.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={({ checked: value }) => onChange(value === true)}
        size="sm"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label fontSize="13px" color="gray.500">
          {label}
        </Checkbox.Label>
      </Checkbox.Root>
      <Text fontSize="12px" color="gray.400" pl="6">
        {disabled && disabledHint ? disabledHint : hint}
      </Text>
    </Stack>
  );
}

/** "We couldn't check…" with a retry. */
export function ImpactError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Flex align="center" justify="space-between" gap="3" py="2">
      <Text fontSize="13px" color="error.300">
        {message}
      </Text>
      <Button size="xs" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </Flex>
  );
}
