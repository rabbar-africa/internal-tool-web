import { matchPath } from "@/utils/navigation";
import { removeToken } from "@/utils/persistToken";
import { useLocation, useNavigate } from "react-router";
import { Box, Flex, Text } from "@chakra-ui/react";
import { RouteConstants } from "@/shared/constants/routes";
import storage from "@/utils/storage";
import { Logo } from "../common/Logo";
import { sideBarItems } from "@/shared/data";

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobile, onNavigate }) => {
  const currentRoute = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    storage.clearValue("current_org");
    window.location.replace(RouteConstants.auth.login.path);
  };

  return (
    <Box
      minW="259px"
      width="259px"
      height="100%"
      maxH={mobile ? "unset" : "1024px"}
      overflowY="auto"
      bg="black"
      display="flex"
      flexDirection="column"
      scrollbarWidth="none"
      borderRight={mobile ? "none" : "1px solid #EBEBEB"}
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Box bg={"white"} py="1.5rem" pl="29.11px">
        <Logo w={"10rem"} />
      </Box>
      <Flex pt={"2rem"} bg={"black"} flexDirection="column">
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
              paddingLeft={isActive ? "36.81px" : "39.81px"}
              cursor="pointer"
              bgColor={isActive ? "primary.50" : "transparent"}
              borderLeft={isActive ? "4px solid" : "none"}
              borderColor={isActive ? "primary.300" : "transparent"}
              role="button"
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
                color={isActive ? "primary.300" : "white"}
              />
              <Text
                fontSize="14px"
                fontWeight="400"
                lineHeight="22px"
                ml="16px"
                color={isActive ? "primary.300" : "white"}
              >
                {item.name}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
