import { matchPath } from "@/utils/navigation";
import { removeToken } from "@/utils/persistToken";
import { useLocation, useNavigate } from "react-router";
import { Box, Flex, Text } from "@chakra-ui/react";
import { RouteConstants } from "@/shared/constants/routes";
import storage from "@/utils/storage";
import { Logo } from "../common/Logo";
import { sideBarItems } from "@/shared/data";
import { CaretLeft } from "@/assets/custom/CaretLeft";
import { CaretRight } from "@/assets/custom/CaretRight";

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobile,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const currentRoute = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    storage.clearValue("current_org");
    window.location.replace(RouteConstants.auth.login.path);
  };

  const collapsed = !mobile && isCollapsed;

  return (
    <Box
      width={collapsed ? "72px" : "259px"}
      minW={collapsed ? "72px" : "259px"}
      height="100%"
      maxH={mobile ? "unset" : "100vh"}
      overflowY="auto"
      bg="primary.500"
      display="flex"
      flexDirection="column"
      scrollbarWidth="none"
      borderRight={mobile ? "none" : "1px solid rgba(255,255,255,0.1)"}
      transition="width 0.2s ease, min-width 0.2s ease"
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {/* Logo area */}
      <Box
        bg="white"
        py="1.5rem"
        pl={collapsed ? "0" : "29.11px"}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        transition="padding 0.2s ease"
      >
        {collapsed ? (
          <Box w="32px" h="32px" bg="primary.500" rounded="md" />
        ) : (
          <Logo w={"10rem"} />
        )}
      </Box>

      {/* Nav items */}
      <Flex pt={"2rem"} bg={"primary.500"} flexDirection="column" flex="1">
        {sideBarItems.map((item) => {
          const isActive = matchPath(
            currentRoute.pathname,
            item.href,
            item.paths,
          );

          return (
            <Flex
              alignItems="center"
              height="50px"
              key={item.name}
              paddingLeft={collapsed ? "0" : isActive ? "36.81px" : "39.81px"}
              justifyContent={collapsed ? "center" : "flex-start"}
              cursor="pointer"
              bgColor={isActive ? "rgba(255,255,255,0.15)" : "transparent"}
              borderLeft={isActive && !collapsed ? "4px solid" : "none"}
              borderColor="white"
              role="button"
              title={collapsed ? item.name : undefined}
              _hover={{ bgColor: "rgba(255,255,255,0.1)" }}
              onClick={() => {
                if (item.name === "Logout") {
                  handleLogout();
                } else {
                  navigate(item.href);
                  onNavigate?.();
                }
              }}
            >
              <item.icon
                width="24.5px"
                height="25px"
                color={isActive ? "white" : "rgba(255,255,255,0.7)"}
              />
              {!collapsed && (
                <Text
                  fontSize="14px"
                  fontWeight={isActive ? "500" : "400"}
                  lineHeight="22px"
                  ml="16px"
                  color={isActive ? "white" : "rgba(255,255,255,0.7)"}
                >
                  {item.name}
                </Text>
              )}
            </Flex>
          );
        })}
      </Flex>

      {/* Collapse toggle — desktop only */}
      {!mobile && (
        <Flex
          justify="center"
          py="3"
          borderTop="1px solid rgba(255,255,255,0.15)"
          cursor="pointer"
          _hover={{ bgColor: "rgba(255,255,255,0.1)" }}
          onClick={onToggleCollapse}
          role="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <CaretRight
              width="18px"
              height="18px"
              color="rgba(255,255,255,0.7)"
            />
          ) : (
            <Flex align="center" gap="2" pr="4">
              <CaretLeft
                width="18px"
                height="18px"
                color="rgba(255,255,255,0.7)"
              />
              <Text fontSize="13px" color="rgba(255,255,255,0.7)">
                Collapse
              </Text>
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
};
