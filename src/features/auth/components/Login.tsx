import { Head } from "@/components/seo/head";
import { CustomInput } from "@/components/input";
import { EyeIcon, EyeOff, Lock, Mail } from "@/assets/custom";
import { Box, Button, Text, chakra } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginMutation } from "../api";
import { RouteConstants } from "@/shared/constants/routes";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      loginMutation.mutate({
        // Normalize to guard against mobile keyboards that auto-capitalize.
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    },
  });

  return (
    <>
      <Head title="Login" description="Login to your account" />

      <Box w="100%" maxW="26rem">
        <Text
          fontSize="1.75rem"
          lineHeight="1.2"
          fontWeight="700"
          letterSpacing="-0.02em"
          color="primary.500"
        >
          Welcome back
        </Text>
        <Text mt="0.625rem" fontSize="0.9375rem" color="gray.300">
          Sign in to pick up where your workshop left off.
        </Text>

        <chakra.form mt="2.25rem" onSubmit={formik.handleSubmit}>
          <CustomInput
            label="Email"
            placeholder="you@workshop.com"
            required={true}
            disabled={loginMutation.isPending}
            error={formik.touched.email ? formik.errors.email : undefined}
            inputProps={{
              name: "email",
              type: "email",
              autoComplete: "email",
              value: formik.values.email,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            leftElement={<Mail w={".875rem"} color={"gray.300"} />}
          />

          <Box mt="1.25rem">
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              required={true}
              disabled={loginMutation.isPending}
              error={
                formik.touched.password ? formik.errors.password : undefined
              }
              inputProps={{
                name: "password",
                autoComplete: "current-password",
                value: formik.values.password,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
              leftElement={<Lock w={".75rem"} color={"gray.300"} />}
              rightElement={
                <chakra.button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  display="flex"
                >
                  {showPassword ? (
                    <EyeIcon
                      cursor={"pointer"}
                      w={".875rem"}
                      color={"gray.300"}
                    />
                  ) : (
                    <EyeOff
                      cursor={"pointer"}
                      w={".875rem"}
                      color={"gray.300"}
                    />
                  )}
                </chakra.button>
              }
            />
          </Box>

          <Text
            fontSize="0.8125rem"
            textAlign="right"
            mt="0.75rem"
            color="primary.300"
            fontWeight="600"
            asChild
          >
            <Link to={RouteConstants.auth.resetPassword.path}>
              Forgot password?
            </Link>
          </Text>

          <Button
            mt="1.75rem"
            width="full"
            type="submit"
            variant="accent"
            loading={loginMutation.isPending}
            loadingText="Signing in..."
            disabled={loginMutation.isPending}
          >
            Sign in
          </Button>

          <Text
            fontSize="0.875rem"
            textAlign="center"
            mt="1.75rem"
            color="gray.300"
          >
            New to Jobcard?{" "}
            <Text asChild color="primary.300" fontWeight="600">
              <Link to={RouteConstants.auth.signup.path}>
                Create a workshop
              </Link>
            </Text>
          </Text>
        </chakra.form>
      </Box>
    </>
  );
}
