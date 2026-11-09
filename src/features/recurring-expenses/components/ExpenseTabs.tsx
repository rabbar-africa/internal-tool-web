import { Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";

const TABS = [
  {
    value: "all",
    label: "All Expenses",
    to: RouteConstants.expenses.base.path,
  },
  {
    value: "recurring",
    label: "Recurring",
    to: RouteConstants.expenses.recurring.path,
  },
] as const;

/** Expenses → All / Recurring. Each is its own page, so a tab is a link. */
export function ExpenseTabs({ active }: { active: "all" | "recurring" }) {
  return (
    <Flex
      gap="1"
      borderBottomWidth="1px"
      borderColor="gray.75"
      role="tablist"
      aria-label="Expenses"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.value}
            asChild
            role="tab"
            aria-selected={isActive}
            px="3"
            py="2"
            mb="-1px"
            fontSize="14px"
            fontWeight={isActive ? "600" : "500"}
            color={isActive ? "primary.300" : "gray.300"}
            borderBottomWidth="2px"
            borderColor={isActive ? "primary.300" : "transparent"}
            _hover={{ color: "primary.300", textDecoration: "none" }}
            // Chakra's Link rings on any focus; only the keyboard needs it.
            focusRing="none"
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "primary.300",
              outlineOffset: "-2px",
            }}
          >
            <RouterLink to={tab.to}>{tab.label}</RouterLink>
          </Link>
        );
      })}
    </Flex>
  );
}
