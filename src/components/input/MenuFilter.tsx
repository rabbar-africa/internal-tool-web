import { Button, Menu, Portal, Text, type ButtonProps } from "@chakra-ui/react";
import { CheckLine, ChevronDownLine } from "@/assets/custom/LineIcons";

export interface MenuFilterOption {
  label: string;
  /** "" is "all" / no filter. */
  value: string;
}

export interface MenuFilterProps {
  /** Shown before the choice: "Status" → "Status: Paid". */
  label: string;
  value: string;
  options: MenuFilterOption[];
  onChange: (value: string) => void;
  /** What an empty value reads as. Default "All". */
  emptyLabel?: string;
  /** For the trigger button (width, flex…). */
  triggerProps?: ButtonProps;
}

/**
 * A list filter as a compact button, "Status: All ▾", that opens a menu of
 * choices with a tick on the current one. Soft at rest; a clear border and
 * ring while it's focused or open.
 *
 *   <MenuFilter label="Status" value={status} options={STATUS_OPTIONS}
 *     onChange={(v) => setFilters({ status: v, page: 1 })} />
 */
export function MenuFilter({
  label,
  value,
  options,
  onChange,
  emptyLabel = "All",
  triggerProps,
}: MenuFilterProps) {
  const current = options.find((option) => option.value === (value || ""));
  const active = Boolean(value);

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          h="2.5rem"
          px="3.5"
          gap="1.5"
          justifyContent="space-between"
          borderColor={active ? "primary.100" : "gray.75"}
          _hover={{ bg: "white", borderColor: "gray.100" }}
          _focusVisible={{
            outline: "none",
            borderColor: "primary.300",
            boxShadow: "0 0 0 3px rgba(1, 48, 100, 0.12)",
          }}
          _expanded={{
            borderColor: "primary.300",
            boxShadow: "0 0 0 3px rgba(1, 48, 100, 0.12)",
          }}
          {...triggerProps}
        >
          <Text as="span" fontWeight="400" color="gray.300">
            {label}:
          </Text>
          <Text as="span" fontWeight="500" color="gray.500" truncate>
            {current?.label ?? emptyLabel}
          </Text>
          <ChevronDownLine boxSize="3.5" color="gray.300" ml="0.5" />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW="13rem"
            maxH="20rem"
            overflowY="auto"
            p="1.5"
            rounded="xl"
            borderWidth="1px"
            borderColor="gray.75"
            boxShadow="0 12px 32px rgba(0, 31, 62, 0.12)"
          >
            {options.map((option) => {
              const selected = (value || "") === option.value;
              return (
                <Menu.Item
                  key={option.value || "__all"}
                  value={option.value || "__all"}
                  onClick={() => onChange(option.value)}
                  justifyContent="space-between"
                  px="3"
                  py="2"
                  rounded="lg"
                  fontSize="14px"
                  cursor="pointer"
                  color={selected ? "primary.300" : "gray.500"}
                  fontWeight={selected ? "600" : "400"}
                  _highlighted={{ bg: "gray.50" }}
                >
                  {option.label}
                  {selected && <CheckLine boxSize="1rem" />}
                </Menu.Item>
              );
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
