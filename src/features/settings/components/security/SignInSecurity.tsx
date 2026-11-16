import { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import ConsentDialog from "@/components/common/ConsentDialog";
import { useLogoutAllMutation } from "@/features/auth/api";
import { SettingsSubPage } from "../SettingsSubPage";

/**
 * Settings → Sign-in & security: the person's own sessions. Open to everyone,
 * whatever their role (docs/frontend-sign-out.md).
 */
export function SignInSecurity() {
  const [confirming, setConfirming] = useState(false);
  const { mutate: logoutAll, isPending } = useLogoutAllMutation();

  return (
    <SettingsSubPage
      title="Sign-in & security"
      subtitle="Where your account is signed in"
    >
      <Flex
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        p="4"
        gap="4"
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
      >
        <Box>
          <Text fontSize="14px" fontWeight="600" color="black">
            Sign out of all devices
          </Text>
          <Text fontSize="13px" color="gray.400" mt="1" maxW="520px">
            Signs your account out on every phone, tablet and computer,
            including this one. Use it if you changed your password, lost a
            device, or think someone else used your account.
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          color="black"
          borderColor="gray.200"
          flexShrink={0}
          onClick={() => setConfirming(true)}
        >
          Sign out of all devices
        </Button>
      </Flex>

      <ConsentDialog
        open={confirming}
        onOpenChange={({ open }) => {
          if (!open && !isPending) setConfirming(false);
        }}
        handleSubmit={() => logoutAll()}
        isLoading={isPending}
        variant="warning"
        heading="Sign out of all devices?"
        note="Every device signed in to your account will be signed out, and you'll be signed out here too."
        confirmText="Sign out everywhere"
      />
    </SettingsSubPage>
  );
}
