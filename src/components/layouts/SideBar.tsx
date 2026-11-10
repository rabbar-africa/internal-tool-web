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

const IDLE_TEXT = "rgba(255,255,255,0.68)";
const IDLE_ICON = "rgba(255,255,255,0.5)";
// Well apart, so a hovered row never looks half selected.
const HOVER_BG = "rgba(255,255,255,0.06)";
const ACTIVE_BG = "rgba(255,255,255,0.13)";
const DIVIDER = "rgba(255,255,255,0.1)";
/** The logo's lime, used for one thing only: "you are here". */
const ACCENT = "secondary.300";

// Where the guide line under a group's icon sits, from the sidebar's edge.
const GUIDE_LEFT = 27;
const SUB_ROW_LEFT = GUIDE_LEFT + 8;

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
  currentGroup = false,
  indented = false,
  iconOnly = false,
  smallIcon = false,
  ariaCurrent,
  ariaExpanded,
  onClick,
  children,
}: {
  label: string;
  icon?: SideBarItem["icon"];
  /** The page you are on: the only row that gets a fill. */
  active?: boolean;
  /** A heading whose group holds the page you are on: emphasis, no fill. */
  currentGroup?: boolean;
  /** A page inside a group: sits to the right of the guide line. */
  indented?: boolean;
  iconOnly?: boolean;
  /** For a caret, narrow beside the other icons: keeps the label in line. */
  smallIcon?: boolean;
  ariaCurrent?: boolean;
  ariaExpanded?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  const here = active || currentGroup;
  return (
    <Flex
      as="button"
      position="relative"
      alignItems="center"
      flexShrink={0}
      w={indented ? `calc(100% - ${SUB_ROW_LEFT + 8}px)` : "calc(100% - 16px)"}
      ml={indented ? `${SUB_ROW_LEFT}px` : "2"}
      mr="2"
      mt="2px"
      rounded="md"
      textAlign="left"
      // Roomier below lg, where the sidebar is a drawer tapped with a finger.
      height={
        indented ? { base: "36px", lg: "32px" } : { base: "40px", lg: "36px" }
      }
      paddingLeft={iconOnly ? "0" : "10px"}
      paddingRight={iconOnly ? "0" : "10px"}
      justifyContent={iconOnly ? "center" : "flex-start"}
      cursor="pointer"
      bgColor={active ? ACTIVE_BG : "transparent"}
      color={here ? "white" : IDLE_TEXT}
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? label : undefined}
      aria-current={ariaCurrent ? "page" : undefined}
      aria-expanded={ariaExpanded}
      // On the guide line, level with the page you are on.
      _before={
        indented && active
          ? {
              content: '""',
              position: "absolute",
              left: "-8px",
              top: "0",
              bottom: "0",
              w: "2px",
              bg: ACCENT,
            }
          : undefined
      }
      _hover={{ bgColor: active ? ACTIVE_BG : HOVER_BG, color: "white" }}
      _focusVisible={{ outline: "2px solid white", outlineOffset: "1px" }}
      transition="background-color 0.12s ease, color 0.12s ease"
      onClick={onClick}
    >
      {Icon &&
        (smallIcon ? (
          <Icon
            width="6px"
            height="11px"
            mx={iconOnly ? "0" : "6px"}
            color={IDLE_ICON}
            flexShrink={0}
          />
        ) : (
          <Icon
            width="18px"
            height="18px"
            color={here ? ACCENT : IDLE_ICON}
            flexShrink={0}
          />
        ))}
      {!iconOnly && (
        <Text
          flex="1"
          minW={0}
          truncate
          fontSize="14px"
          fontWeight={here ? "600" : indented ? "400" : "500"}
          lineHeight="20px"
          ml={Icon ? "10px" : "0"}
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
  const { canAccess } = usePermissions();
  const { hasFeature } = usePlanAccess();

  const collapsed = !mobile && isCollapsed;

  const groups = useMemo<SideBarGroup[]>(
    () =>
      sideBarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.page || canAccess(item.page),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [canAccess],
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
      width={collapsed ? "56px" : "240px"}
      minW={collapsed ? "56px" : "240px"}
      height="100%"
      maxH={mobile ? "unset" : "100vh"}
      bg="primary.500"
      display="flex"
      flexDirection="column"
      transition="width 0.2s ease, min-width 0.2s ease"
    >
      {/* Logo area */}
      <Box
        // Lines up with the top bar beside it.
        h="64px"
        borderBottom={`1px solid ${DIVIDER}`}
        pl={collapsed ? "0" : "18px"}
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
            w="28px"
            h="28px"
            objectFit="contain"
          />
        ) : (
          <Logo color="white" w={"7.25rem"} />
        )}
      </Box>

      {/* Scrolls by itself, so Settings below stays in reach */}
      <Flex
        as="nav"
        aria-label="Main"
        pt="2"
        pb="2"
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
                mt="1.5"
                pt="1"
                borderTop={`1px solid ${DIVIDER}`}
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
          const isCurrentGroup = group.name === activeGroup;
          return (
            <Box key={group.name}>
              <NavRow
                label={group.name}
                icon={group.icon}
                currentGroup={isCurrentGroup}
                ariaExpanded={open}
                onClick={() => toggleGroup(group.name)}
              >
                <CaretRight
                  width="5px"
                  height="9px"
                  flexShrink={0}
                  color={IDLE_ICON}
                  transform={open ? "rotate(90deg)" : "rotate(0deg)"}
                  transition="transform 0.15s ease"
                />
              </NavRow>
              {open && (
                <Box
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: `${GUIDE_LEFT}px`,
                    top: "2px",
                    bottom: "0",
                    w: "1px",
                    bg: DIVIDER,
                  }}
                >
                  {group.items.map((item) => (
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
              )}
            </Box>
          );
        })}
      </Flex>

      <Box flexShrink={0} pt="1" pb="2" borderTop={`1px solid ${DIVIDER}`}>
        {topLevelRow(sideBarFooter)}
        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <NavRow
            label={collapsed ? "Expand sidebar" : "Collapse"}
            icon={collapsed ? CaretRight : CaretLeft}
            iconOnly={collapsed}
            smallIcon
            onClick={() => onToggleCollapse?.()}
          />
        )}
      </Box>
    </Box>
  );
};
