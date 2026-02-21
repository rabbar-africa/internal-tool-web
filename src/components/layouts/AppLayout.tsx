import { Box, Drawer, Flex, Loader, Portal, Stack } from "@chakra-ui/react";
import { Suspense, useState, type ReactNode } from "react";
import { UserDashboardContainer } from "../hoc";
import { Sidebar } from "./SideBar";
import { NavBar } from "./NavBar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <Box height="100vh" display="flex" flexDirection="column" bg="#F7F7F7">
      <Flex flex="1" overflow="hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <Box display={{ base: "none", md: "block" }}>
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />
        </Box>

        <Stack gap={0} flex="1" minHeight={0} position="relative">
          <NavBar onMenuToggle={() => setMobileNavOpen(true)} />
          <Box flex="1" overflow="auto">
            <UserDashboardContainer pt={"1.75rem"}>
              <Suspense fallback={<Loader />}>{children}</Suspense>
            </UserDashboardContainer>
          </Box>
        </Stack>
      </Flex>

      {/* Mobile drawer sidebar */}
      <Drawer.Root
        open={isMobileNavOpen}
        onOpenChange={(e) => setMobileNavOpen(e.open)}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content p={0} bg="#293885" maxW="259px" w="259px">
              <Drawer.Body p={0}>
                <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
