import { useLogout } from "@/features/auth/api";
import {
  Avatar,
  // Badge,
  Box,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { Hamburger } from "@/assets/custom";
// import { BellSimpleRingingIcon } from "@/assets/custom/BellSimpleRingingIcon";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { GearIcon } from "@/assets/custom/GearIcon";
import { Money } from "@/assets/custom/Money";
import { SignOutIcon } from "@/assets/custom/SignOutIcon";
import { RouteConstants } from "@/shared/constants/routes";
import { QuickSearch } from "@/features/search/components/QuickSearch";

interface NavBarProps {
  onMenuToggle?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onMenuToggle }) => {
  const {
    userData: currentUser,
    userOrganization,
    userRoles,
  } = useCurrentUser();
  const handleLogout = useLogout();
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const formattedRoles = userRoles?.map((role) =>
    role.toLowerCase().replace(/_/g, " "),
  );

  return (
    <Flex
      height="64px"
      width="100%"
      bg="white"
      alignItems="center"
      justifyContent="space-between"
      borderBottom="1px solid #EBEBEB"
    >
      <UserDashboardContainer>
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="12px" flex="1" minW="0">
            {/* Hamburger – visible only on mobile */}
            <Box display={{ base: "flex", lg: "none" }}>
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

            <QuickSearch />
          </Flex>

          {/* Right: Search + Notifications + Profile */}
          <Flex alignItems="center" gap="3" flexShrink={0} ml="4">
            {/* Company label – desktop only */}
            <Text
              fontSize="14px"
              fontWeight="600"
              color="gray.500"
              display={{ base: "none", xl: "block" }}
              maxW="14rem"
              truncate
            >
              {userOrganization?.name}
            </Text>

            {/* Notification bell */}
            {/* <Box position="relative">
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
            </Box> */}

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
                    <Avatar.Image
                      src={userOrganization?.logoUrl}
                      alt="avatar-image"
                    />
                  </Avatar.Root>
                  <Flex
                    mx="10px"
                    direction="column"
                    display={{ base: "none", sm: "flex" }}
                  >
                    <Text fontWeight={600} fontSize="14px" color="gray.500">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </Text>
                    <Text
                      fontWeight={400}
                      fontSize="14px"
                      color="gray.200"
                      textTransform={"capitalize"}
                    >
                      {formattedRoles?.join(", ") || "No role assigned"}
                    </Text>
                  </Flex>
                </Flex>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    minW="16rem"
                    p="0"
                    rounded="xl"
                    borderWidth="1px"
                    borderColor="gray.75"
                    boxShadow="0 12px 32px rgba(0, 31, 62, 0.12)"
                    overflow="hidden"
                  >
                    <Box
                      px="4"
                      py="3.5"
                      borderBottomWidth="1px"
                      borderColor="gray.75"
                    >
                      <Text
                        fontSize="15px"
                        fontWeight="700"
                        color="gray.500"
                        truncate
                      >
                        {currentUser?.firstName} {currentUser?.lastName}
                      </Text>
                      {currentUser?.email && (
                        <Text fontSize="13px" color="gray.300" truncate>
                          {currentUser.email}
                        </Text>
                      )}
                    </Box>
                    <Box p="1.5">
                      {canAccess("billing") && (
                        <UserMenuItem
                          value="billing"
                          icon={<Money boxSize="1.1rem" />}
                          label="Plan & Billing"
                          onSelect={() =>
                            navigate(RouteConstants.settings.billing.path)
                          }
                        />
                      )}
                      <UserMenuItem
                        value="settings"
                        icon={<GearIcon boxSize="1.1rem" />}
                        label="Settings"
                        onSelect={() =>
                          navigate(RouteConstants.settings.base.path)
                        }
                      />
                    </Box>
                    <Box p="1.5" borderTopWidth="1px" borderColor="gray.75">
                      <UserMenuItem
                        value="sign-out"
                        icon={<SignOutIcon boxSize="1.1rem" />}
                        label="Sign out"
                        onSelect={handleLogout}
                      />
                    </Box>
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

/** A row of the account menu: icon, then label. */
function UserMenuItem({
  value,
  icon,
  label,
  onSelect,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Menu.Item
      value={value}
      onClick={onSelect}
      cursor="pointer"
      gap="3"
      px="3"
      py="2.5"
      rounded="lg"
      fontSize="14px"
      color="gray.500"
      _highlighted={{ bg: "gray.50" }}
    >
      <Box as="span" display="inline-flex" color="gray.400">
        {icon}
      </Box>
      {label}
    </Menu.Item>
  );
}
