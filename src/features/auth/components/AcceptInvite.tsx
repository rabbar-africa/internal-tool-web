import { Box, Button, Flex, Spinner, Text, chakra } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Head } from "@/components/seo/head";
import { CustomInput } from "@/components/input";
import { EyeIcon, EyeOff, Lock, Mail, User } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import { getErrorMessage } from "@/utils/handle-error";
import { useAcceptInviteMutation, useValidateInviteQuery } from "../api";

const acceptSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  phoneNumber: Yup.string().trim(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

/** `workshop_manager` → `Workshop Manager`. */
const prettyRole = (name: string) =>
  name.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      w={{ base: "100%", md: "45.5625rem" }}
      bg="white"
      p={{ base: "2rem", md: "3rem" }}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Box w={{ base: "100%", md: "31.5625rem" }} mx="auto">
        {children}
      </Box>
    </Box>
  );
}

/**
 * The page the invite email links to (`/auth/accept-invite?token=…`). The token
 * is validated before the form is shown, so an expired or cancelled invite says
 * so rather than failing only after the user has filled everything in.
 */
export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const {
    data: invite,
    isLoading,
    isError,
    error,
  } = useValidateInviteQuery(token);
  const acceptMutation = useAcceptInviteMutation();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: acceptSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      acceptMutation.mutate({
        token,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        password: values.password,
        ...(values.phoneNumber.trim()
          ? { phoneNumber: values.phoneNumber.trim() }
          : {}),
      });
    },
  });

  // ── Token problems ────────────────────────────────────────────────────────

  if (!token) {
    return (
      <Shell>
        <Head title="Invitation" description="Accept your invitation" />
        <Text textStyle="h4-semibold" color="gray.900" mb="2">
          Invitation link is incomplete
        </Text>
        <Text textStyle="small-regular" color="gray.400">
          Open the link straight from your invitation email — it carries a token
          this page needs.
        </Text>
      </Shell>
    );
  }

  if (isLoading) {
    return (
      <Shell>
        <Flex direction="column" align="center" gap="3" py="8">
          <Spinner size="lg" color="primary.400" />
          <Text textStyle="small-regular" color="gray.400">
            Checking your invitation...
          </Text>
        </Flex>
      </Shell>
    );
  }

  if (isError || !invite) {
    return (
      <Shell>
        <Head title="Invitation" description="Accept your invitation" />
        <Text textStyle="h4-semibold" color="gray.900" mb="2">
          This invitation can't be used
        </Text>
        <Text textStyle="small-regular" color="gray.400">
          {getErrorMessage(error) ||
            "The link may have expired or already been used."}{" "}
          Ask whoever invited you to send a new one.
        </Text>
        <Text textStyle="small-regular" mt="6" color="gray.400">
          Already have an account?{" "}
          <Link to={RouteConstants.auth.login.path}>
            <Text as="span" color="primary.400" fontWeight="600">
              Sign in
            </Text>
          </Link>
        </Text>
      </Shell>
    );
  }

  // ── The form ──────────────────────────────────────────────────────────────

  const isSubmitting = acceptMutation.isPending;

  return (
    <Shell>
      <Head
        title="Accept Invitation"
        description={`Join ${invite.organizationName}`}
      />

      <Text
        textStyle={{ base: "h4-semibold", lg: "h3-bold" }}
        color="gray.900"
        mb=".625rem"
        textAlign={{ base: "center", lg: "left" }}
      >
        Join {invite.organizationName}
      </Text>
      <Text
        textStyle="small-regular"
        textAlign={{ base: "center", lg: "left" }}
        color="gray.400"
      >
        Set up your account to get started. You'll sign in with{" "}
        <Text as="span" fontWeight="600" color="gray.500">
          {invite.email}
        </Text>
        .
      </Text>

      {invite.roles.length > 0 ? (
        <Flex
          gap="1.5"
          wrap="wrap"
          mt="4"
          justify={{ base: "center", lg: "flex-start" }}
        >
          {invite.roles.map((role) => (
            <Box
              key={role}
              bg="primary.50"
              color="primary.400"
              fontSize="11px"
              fontWeight="600"
              px="2.5"
              py="1"
              rounded="full"
            >
              {prettyRole(role)}
            </Box>
          ))}
        </Flex>
      ) : null}

      <chakra.form mt="2rem" onSubmit={formik.handleSubmit}>
        <Flex gap="1rem" direction={{ base: "column", sm: "row" }}>
          <Box flex="1">
            <CustomInput
              label="First name"
              placeholder="Enter your first name"
              required
              disabled={isSubmitting}
              error={
                formik.touched.firstName ? formik.errors.firstName : undefined
              }
              inputProps={{
                name: "firstName",
                value: formik.values.firstName,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
              leftElement={<User w=".875rem" color="gray.300" />}
            />
          </Box>
          <Box flex="1">
            <CustomInput
              label="Last name"
              placeholder="Enter your last name"
              required
              disabled={isSubmitting}
              error={
                formik.touched.lastName ? formik.errors.lastName : undefined
              }
              inputProps={{
                name: "lastName",
                value: formik.values.lastName,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
              leftElement={<User w=".875rem" color="gray.300" />}
            />
          </Box>
        </Flex>

        <Box mt="1.5rem">
          {/* Email comes from the invite and can't be changed here. */}
          <CustomInput
            label="Email"
            disabled
            value={invite.email}
            leftElement={<Mail w=".875rem" color="gray.300" />}
          />
        </Box>

        <Box mt="1.5rem">
          <CustomInput
            label="Phone number"
            placeholder="Optional"
            disabled={isSubmitting}
            error={
              formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined
            }
            inputProps={{
              name: "phoneNumber",
              value: formik.values.phoneNumber,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
          />
        </Box>

        <Box mt="1.5rem">
          <CustomInput
            label="Password"
            placeholder="At least 8 characters"
            type={showPassword ? "text" : "password"}
            required
            disabled={isSubmitting}
            error={formik.touched.password ? formik.errors.password : undefined}
            inputProps={{
              name: "password",
              value: formik.values.password,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
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
            label="Confirm password"
            placeholder="Re-enter your password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isSubmitting}
            error={
              formik.touched.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
            inputProps={{
              name: "confirmPassword",
              value: formik.values.confirmPassword,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            leftElement={<Lock w=".75rem" color="gray.700" />}
          />
        </Box>

        <Button
          type="submit"
          w="100%"
          mt="2rem"
          size="lg"
          loading={isSubmitting}
          loadingText="Creating your account..."
        >
          Accept invitation
        </Button>
      </chakra.form>
    </Shell>
  );
}
