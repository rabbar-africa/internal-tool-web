import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "../../api";

const RESEND_COOLDOWN = 30; // second
interface VerifyEmailStepProps {
  email?: string;
  /** Called once the email is successfully verified. */
  onCompleted: () => void;
}

export function VerifyEmailStep({ email, onCompleted }: VerifyEmailStepProps) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: verify, isPending: isVerifying } =
    useVerifyEmailMutation();
  const { mutateAsync: resend, isPending: isResending } =
    useResendVerificationMutation();

  // Cooldown ticker for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.trim().length < 6) return;
    await verify(code.trim());
    onCompleted();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    await resend();
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <Stack gap="5">
      <Box>
        <Text fontSize="14px" fontWeight="600" color="gray.500" mb="1">
          Verify your email
        </Text>
        <Text fontSize="13px" color="gray.400" lineHeight="1.6">
          We sent a 6-digit code to{" "}
          <Text as="span" fontWeight="600" color="gray.500">
            {email || "your email address"}
          </Text>
          . Enter it below to activate your account.
        </Text>
      </Box>

      <Box>
        <Text fontSize="11px" fontWeight="600" color="gray.300" mb="2">
          Verification code
        </Text>
        <Input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleVerify();
            }
          }}
          inputMode="numeric"
          placeholder="000000"
          h="3rem"
          textAlign="center"
          fontSize="22px"
          fontWeight="600"
          letterSpacing="0.5rem"
          borderColor="gray.100"
          autoFocus
        />
      </Box>

      <Button
        width="full"
        onClick={handleVerify}
        loading={isVerifying}
        loadingText="Verifying..."
        disabled={code.trim().length < 6}
      >
        Verify email
      </Button>

      <Flex justify="center" gap="1.5" align="center">
        <Text fontSize="13px" color="gray.400">
          Didn't get the code?
        </Text>
        <Flex
          align="center"
          gap="1.5"
          fontSize="13px"
          fontWeight="600"
          color={cooldown > 0 || isResending ? "gray.300" : "primary.400"}
          cursor={cooldown > 0 || isResending ? "default" : "pointer"}
          onClick={handleResend}
        >
          {isResending && <Spinner size="xs" />}
          <Text>
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </Text>
        </Flex>
      </Flex>
    </Stack>
  );
}
