import { useEffect, useMemo, useState } from "react";
import { matchPath } from "@/utils/navigation";
import { useLocation, useNavigate } from "react-router";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import storage from "@/utils/storage";
import { Logo } from "../common/Logo";
import rabbarIcon from "@/assets/images/logo/rabbar-icon.png";
import {
  sideBarFooter,
  sideBarGroups,
  sideBarHome,
  type SideBarGroup,
  type SideBarItem,
} from "@/shared/data";
import { usePermissions } from "@/hooks/usePermissions";
import { PlanBadge } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { CaretLeft } from "@/assets/custom/CaretLeft";
import { CaretRight } from "@/assets/custom/CaretRight";

const ACTIVE_TEXT = "white";
const IDLE_TEXT = "rgba(255,255,255,0.7)";
const ACTIVE_BG = "rgba(255,255,255,0.15)";
const HOVER_BG = "rgba(255,255,255,0.1)";

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/** One line of the sidebar: a page, or a group's heading. */
function NavRow({
  label,
  icon: Icon,
  active = false,
  indented = false,
  iconOnly = false,
  ariaCurrent,
  ariaExpanded,
  onClick,
  children,
}: {
  label: string;
  icon?: SideBarItem["icon"];
  active?: boolean;
  /** A page inside an open group: lines up under its heading's text. */
  indented?: boolean;
  iconOnly?: boolean;
  ariaCurrent?: boolean;
  ariaExpanded?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  const color = active ? ACTIVE_TEXT : IDLE_TEXT;
  return (
    <Flex
      as="button"
      alignItems="center"
      flexShrink={0}
      w="100%"
      textAlign="left"
      height={indented ? "38px" : "44px"}
      paddingLeft={iconOnly ? "0" : indented ? "57px" : "21px"}
      paddingRight={iconOnly ? "0" : "16px"}
      justifyContent={iconOnly ? "center" : "flex-start"}
      cursor="pointer"
      bgColor={active ? ACTIVE_BG : "transparent"}
      // Always there, so turning active doesn't nudge the text sideways.
      borderLeft={iconOnly ? "none" : "3px solid"}
      borderColor={active ? "white" : "transparent"}
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? label : undefined}
      aria-current={ariaCurrent ? "page" : undefined}
      aria-expanded={ariaExpanded}
      _hover={{ bgColor: active ? ACTIVE_BG : HOVER_BG }}
      _focusVisible={{ outline: "2px solid white", outlineOffset: "-2px" }}
      onClick={onClick}
    >
      {Icon && <Icon width="22px" height="22px" color={color} flexShrink={0} />}
      {!iconOnly && (
        <Text
          flex="1"
          minW={0}
          fontSize={indented ? "13.5px" : "14px"}
          fontWeight={active ? "500" : "400"}
          lineHeight="20px"
          ml={Icon ? "14px" : "0"}
          color={color}
        >
          {label}
        </Text>
      )}
      {children}
    </Flex>
  );
}

/** First visit: the everyday pages are showing, not just headings. */
const DEFAULT_OPEN_GROUPS = ["Sales", "Finance"];

const readOpenGroups = (): string[] => {
  const saved = storage.getValue<string[]>("sidebar_open_groups");
  return Array.isArray(saved) ? saved : DEFAULT_OPEN_GROUPS;
};

export const Sidebar: React.FC<SidebarProps> = ({
  mobile,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { has } = usePermissions();
  const { hasFeature } = usePlanAccess();

  const collapsed = !mobile && isCollapsed;

  const groups = useMemo<SideBarGroup[]>(
    () =>
      sideBarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.permission || has(item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [has],
  );

  const isActive = (item: SideBarItem) =>
    matchPath(pathname, item.href, item.paths);
  const activeGroup = groups.find((group) => group.items.some(isActive))?.name;

  // Remembered per browser, so the sidebar stays how each person left it.
  const [openGroups, setOpenGroups] = useState<string[]>(readOpenGroups);
  const saveOpenGroups = (next: string[]) => {
    setOpenGroups(next);
    try {
      storage.setValue("sidebar_open_groups", next);
    } catch {
      // Blocked storage only costs remembering it for next time.
    }
  };

  // Arriving on a page opens its group, so where you are is always visible.
  // Only on arrival: the group can still be closed while you're on the page.
  useEffect(() => {
    if (activeGroup && !openGroups.includes(activeGroup)) {
      saveOpenGroups([...openGroups, activeGroup]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  const toggleGroup = (name: string) =>
    saveOpenGroups(
      openGroups.includes(name)
        ? openGroups.filter((open) => open !== name)
        : [...openGroups, name],
    );

  const go = (item: SideBarItem) => {
    navigate(item.href);
    onNavigate?.();
  };

  const topLevelRow = (item: SideBarItem) => (
    <NavRow
      label={item.name}
      icon={item.icon}
      active={isActive(item)}
      ariaCurrent={isActive(item)}
      iconOnly={collapsed}
      onClick={() => go(item)}
    />
  );

  return (
    <Box
      width={collapsed ? "72px" : "259px"}
      minW={collapsed ? "72px" : "259px"}
      height="100%"
      maxH={mobile ? "unset" : "100vh"}
      bg="primary.500"
      display="flex"
      flexDirection="column"
      borderRight={mobile ? "none" : "1px solid rgba(255,255,255,0.1)"}
      transition="width 0.2s ease, min-width 0.2s ease"
    >
      {/* Logo area */}
      <Box
        bg="white"
        py="1.5rem"
        pl={collapsed ? "0" : "24px"}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        transition="padding 0.2s ease"
        flexShrink={0}
      >
        {collapsed ? (
          <Image
            src={rabbarIcon}
            alt="Rabbar"
            w="36px"
            h="36px"
            objectFit="contain"
          />
        ) : (
          <Logo w={"10rem"} />
        )}
      </Box>

      {/* Scrolls by itself, so Settings below stays in reach */}
      <Flex
        as="nav"
        aria-label="Main"
        pt="1rem"
        pb="0.5rem"
        flexDirection="column"
        flex="1"
        minH={0}
        overflowY="auto"
        scrollbarWidth="none"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        {topLevelRow(sideBarHome)}

        {groups.map((group) => {
          // The icon rail has no headings to open: every page, split by a line.
          if (collapsed) {
            return (
              <Box
                key={group.name}
                role="group"
                aria-label={group.name}
                mt="2"
                pt="2"
                borderTop="1px solid rgba(255,255,255,0.15)"
              >
                {group.items.map((item) => (
                  <NavRow
                    key={item.name}
                    label={item.name}
                    icon={item.icon}
                    active={isActive(item)}
                    ariaCurrent={isActive(item)}
                    iconOnly
                    onClick={() => go(item)}
                  />
                ))}
              </Box>
            );
          }

          const open = openGroups.includes(group.name);
          return (
            <Box key={group.name} mt="1">
              <NavRow
                label={group.name}
                icon={group.icon}
                // Closed over the current page: still show where you are.
                active={!open && group.name === activeGroup}
                ariaExpanded={open}
                onClick={() => toggleGroup(group.name)}
              >
                <CaretRight
                  width="7px"
                  height="12px"
                  flexShrink={0}
                  color={IDLE_TEXT}
                  transform={open ? "rotate(90deg)" : "rotate(0deg)"}
                  transition="transform 0.15s ease"
                />
              </NavRow>
              {open &&
                group.items.map((item) => (
                  <NavRow
                    key={item.name}
                    label={item.name}
                    active={isActive(item)}
                    ariaCurrent={isActive(item)}
                    indented
                    onClick={() => go(item)}
                  >
                    {item.planFeature && !hasFeature(item.planFeature) && (
                      <PlanBadge
                        feature={item.planFeature}
                        ml="2"
                        flexShrink={0}
                      />
                    )}
                  </NavRow>
                ))}
            </Box>
          );
        })}
      </Flex>

      <Box flexShrink={0} py="1" borderTop="1px solid rgba(255,255,255,0.15)">
        {topLevelRow(sideBarFooter)}
        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <NavRow
            label={collapsed ? "Expand sidebar" : "Collapse"}
            icon={collapsed ? CaretRight : CaretLeft}
            iconOnly={collapsed}
            onClick={() => onToggleCollapse?.()}
          />
        )}
      </Box>
    </Box>
  );
};
