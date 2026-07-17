import { Head } from "@/components/seo/head";
import { CustomInput } from "@/components/input";
import { EyeIcon, EyeOff, Lock, Mail } from "@/assets/custom";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  chakra,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../api";
import { RouteConstants } from "@/shared/constants/routes";

const RESEND_COOLDOWN = 30; // seconds

const emailSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
});

const resetSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit code")
    .required("Code is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export function ResetPassword() {
  const navigate = useNavigate();
  // Two phases on one page: request the code, then confirm it with a new
  // password. `email` carries across from phase 1 into the reset call.
  const [phase, setPhase] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");

  const forgotMutation = useForgotPasswordMutation();
  const resetMutation = useResetPasswordMutation();

  const requestForm = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const normalized = values.email.trim().toLowerCase();
      await forgotMutation.mutateAsync({ email: normalized });
      setEmail(normalized);
      setPhase("reset");
    },
  });

  return (
    <>
      <Head title="Reset Password" description="Reset your account password" />

      <Box
        w={{ base: "100%", md: "45.5625rem" }}
        bg="white"
        p={{ base: "2rem", md: "3rem" }}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Box w={{ base: "100%", md: "31.5625rem" }} mx="auto">
          {phase === "request" ? (
            <>
              <Text
                textStyle={{ base: "h4-semibold", lg: "h3-bold" }}
                color="gray.900"
                mb=".625rem"
                textAlign={{ base: "center", lg: "left" }}
              >
                Forgot your password?
              </Text>
              <Text
                textStyle="small-regular"
                textAlign={{ base: "center", lg: "left" }}
              >
                Enter your registered email address and we&apos;ll send you a
                6-digit code to reset your password.
              </Text>

              <chakra.form
                mt="2.5rem"
                onSubmit={requestForm.handleSubmit}
                position="relative"
              >
                <CustomInput
                  label="Email"
                  placeholder="Enter your email"
                  required
                  disabled={forgotMutation.isPending}
                  error={
                    requestForm.touched.email
                      ? requestForm.errors.email
                      : undefined
                  }
                  inputProps={{
                    name: "email",
                    type: "email",
                    value: requestForm.values.email,
                    onChange: requestForm.handleChange,
                    onBlur: requestForm.handleBlur,
                  }}
                  leftElement={<Mail w=".875rem" color="gray.300" />}
                />

                <Button
                  mt="2.5rem"
                  width="full"
                  type="submit"
                  loading={forgotMutation.isPending}
                  loadingText="Sending code..."
                  disabled={forgotMutation.isPending}
                >
                  Send reset code
                </Button>

                <BackToLogin />
              </chakra.form>
            </>
          ) : (
            <ResetForm
              email={email}
              onResend={() => forgotMutation.mutate({ email })}
              isResending={forgotMutation.isPending}
              resetMutation={resetMutation}
              onSuccess={() => navigate(RouteConstants.auth.login.path)}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

interface ResetFormProps {
  email: string;
  onResend: () => void;
  isResending: boolean;
  resetMutation: ReturnType<typeof useResetPasswordMutation>;
  onSuccess: () => void;
}

function ResetForm({
  email,
  onResend,
  isResending,
  resetMutation,
  onSuccess,
}: ResetFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useFormik({
    initialValues: { otp: "", password: "", confirmPassword: "" },
    validationSchema: resetSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await resetMutation.mutateAsync({
        email,
        otp: values.otp.trim(),
        password: values.password,
      });
      onSuccess();
    },
  });

  // Cooldown ticker for the resend link (starts as soon as we land here, since
  // the first code was just sent).
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    onResend();
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <>
      <Text
        textStyle={{ base: "h4-semibold", lg: "h3-bold" }}
        color="gray.900"
        mb=".625rem"
        textAlign={{ base: "center", lg: "left" }}
      >
        Reset your password
      </Text>
      <Text
        textStyle="small-regular"
        textAlign={{ base: "center", lg: "left" }}
      >
        If{" "}
        <Text as="span" fontWeight="600" color="gray.500">
          {email}
        </Text>{" "}
        is registered, a 6-digit code has been sent to it. Enter the code below
        with your new password.
      </Text>

      <chakra.form mt="2.5rem" onSubmit={form.handleSubmit} position="relative">
        <Box>
          <Text fontSize="11px" fontWeight="600" color="gray.300" mb="2">
            Verification code
          </Text>
          <Input
            name="otp"
            value={form.values.otp}
            onChange={(e) =>
              form.setFieldValue(
                "otp",
                e.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
            onBlur={form.handleBlur}
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
          {form.touched.otp && form.errors.otp ? (
            <Text fontSize="12px" color="error.300" mt="1.5">
              {form.errors.otp}
            </Text>
          ) : null}
        </Box>

        <Box mt="1.5rem">
          <CustomInput
            label="New password"
            placeholder="Enter your new password"
            type={showPassword ? "text" : "password"}
            required
            disabled={resetMutation.isPending}
            error={form.touched.password ? form.errors.password : undefined}
            inputProps={{
              name: "password",
              value: form.values.password,
              onChange: form.handleChange,
              onBlur: form.handleBlur,
            }}
            leftElement={<Lock w=".75rem" color="gray.700" />}
            rightElement={
              <Box onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? (
                  <EyeIcon cursor="pointer" w=".875rem" color="gray.700" />
                ) : (
                  <EyeOff cursor="pointer" w=".875rem" color="gray.700" />
                )}
              </Box>
            }
          />
        </Box>

        <Box mt="1.5rem">
          <CustomInput
            label="Confirm new password"
            placeholder="Re-enter your new password"
            type={showConfirm ? "text" : "password"}
            required
            disabled={resetMutation.isPending}
            error={
              form.touched.confirmPassword
                ? form.errors.confirmPassword
                : undefined
            }
            inputProps={{
              name: "confirmPassword",
              value: form.values.confirmPassword,
              onChange: form.handleChange,
              onBlur: form.handleBlur,
            }}
            leftElement={<Lock w=".75rem" color="gray.700" />}
            rightElement={
              <Box onClick={() => setShowConfirm((prev) => !prev)}>
                {showConfirm ? (
                  <EyeIcon cursor="pointer" w=".875rem" color="gray.700" />
                ) : (
                  <EyeOff cursor="pointer" w=".875rem" color="gray.700" />
                )}
              </Box>
            }
          />
        </Box>

        <Button
          mt="2.5rem"
          width="full"
          type="submit"
          loading={resetMutation.isPending}
          loadingText="Resetting..."
          disabled={resetMutation.isPending}
        >
          Reset password
        </Button>

        <Flex justify="center" gap="1.5" align="center" mt="1.5rem">
          <Text fontSize="13px" color="gray.400">
            Didn&apos;t get the code?
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

        <BackToLogin />
      </chakra.form>
    </>
  );
}

function BackToLogin() {
  return (
    <Text
      textStyle="small-regular"
      textAlign="center"
      mt="1.5rem"
      color="gray.400"
    >
      Remembered your password?{" "}
      <Text asChild color="primary.400" fontWeight="600">
        <Link to={RouteConstants.auth.login.path}>Back to sign in</Link>
      </Text>
    </Text>
  );
}
