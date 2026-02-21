import { removeToken } from "@/utils/persistToken";
import storage from "@/utils/storage";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";

import AvatarImage from "@/assets/images/michael-peters.png";
import { UserDashboardContainer } from "@/components/hoc";
import { RouteConstants } from "@/shared/constants/routes";
import { Hamburger } from "@/assets/custom";
import { BellSimpleRingingIcon } from "@/assets/custom/BellSimpleRingingIcon";
import { SearchInput } from "@/components/input/SearchInput";

interface NavBarProps {
  onMenuToggle?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onMenuToggle }) => {
  const handleLogout = () => {
    removeToken();
    storage.clearValue("current_org");
    window.location.replace(RouteConstants.auth.login.path);
  };

  return (
    <Flex
      height="80px"
      width="100%"
      bg="white"
      alignItems="center"
      justifyContent="space-between"
      borderBottom="1px solid #EBEBEB"
    >
      <UserDashboardContainer>
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="12px">
            {/* Hamburger – visible only on mobile */}
            <Box display={{ base: "flex", md: "none" }}>
              <IconButton
                aria-label="Open menu"
                variant="ghost"
                size="md"
                onClick={onMenuToggle}
                color="gray.500"
              >
                <Hamburger w={"2rem"} />
              </IconButton>
            </Box>

            {/* Company label – visible only on desktop */}
            <Text
              fontSize="14px"
              fontWeight="600"
              color="gray.500"
              display={{ base: "none", md: "block" }}
            >
              Rabbar Africa
            </Text>
          </Flex>

          {/* Right: Search + Notifications + Profile */}
          <Flex alignItems="center" gap="3">
            {/* Global search – hidden on mobile */}
            <Box display={{ base: "none", lg: "block" }} maxW="200px">
              <SearchInput placeholder="Search..." />
            </Box>

            {/* Notification bell */}
            <Box position="relative">
              <IconButton
                aria-label="Notifications"
                variant="ghost"
                size="md"
                color="gray.400"
              >
                <BellSimpleRingingIcon width="20px" height="20px" />
              </IconButton>
              <Badge
                position="absolute"
                top="6px"
                right="6px"
                bg="red.500"
                color="white"
                fontSize="9px"
                borderRadius="full"
                minW="16px"
                h="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px="1"
              >
                3
              </Badge>
            </Box>

            <Menu.Root>
              <Menu.Trigger asChild>
                <Flex alignItems="center" cursor="pointer">
                  <Avatar.Root
                    shape="full"
                    size="lg"
                    border="1px solid"
                    borderColor="gray.50"
                    bg="white"
                  >
                    <Avatar.Fallback name="MP" />
                    <Avatar.Image src={AvatarImage} alt="avatar-image" />
                  </Avatar.Root>
                  <Flex
                    mx="10px"
                    direction="column"
                    display={{ base: "none", sm: "flex" }}
                  >
                    <Text fontWeight={600} fontSize="14px" color="gray.500">
                      Obia Ugo
                    </Text>
                    <Text
                      fontWeight={400}
                      fontSize="14px"
                      color="gray.200"
                      textTransform={"capitalize"}
                    >
                      Admin
                    </Text>
                  </Flex>
                </Flex>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content width="100%" p="6px">
                    <Menu.Item
                      cursor={"pointer"}
                      p={".25rem"}
                      onClick={handleLogout}
                      value="new-txt"
                    >
                      {" "}
                      Log Out
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>
        </Flex>
      </UserDashboardContainer>
    </Flex>
  );
};
