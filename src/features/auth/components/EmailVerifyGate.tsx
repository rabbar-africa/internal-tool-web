import { Box, Button, Flex } from "@chakra-ui/react";
import { VerifyEmailStep } from "./signup/VerifyEmailStep";
import { useLogout } from "../api";

interface EmailVerifyGateProps {
  email?: string;
}

/**
 * Full-screen gate shown to authenticated users whose email is not yet
 * verified. Reuses the signup OTP step; on success it reloads so the
 * current-user query re-resolves with isEmailVerified = true.
 */
export function EmailVerifyGate({ email }: EmailVerifyGateProps) {
  const logout = useLogout();

  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.50" px="1rem">
      <Box
        w={{ base: "100%", md: "30rem" }}
        bg="white"
        p={{ base: "1.5rem", md: "2.5rem" }}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VerifyEmailStep
          email={email}
          onCompleted={() => window.location.reload()}
        />
        <Flex justify="center" mt="1.5rem">
          <Button variant="ghost" size="sm" color="gray.400" onClick={logout}>
            Sign out
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
