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

      <Box
        w={{
          base: "100%",
          md: "45.5625rem",
        }}
        bg={"white"}
        p={{ base: "2rem", md: "3rem" }}
        borderRadius={"lg"}
        boxShadow={"lg"}
      >
        <Box
          w={{
            base: "100%",
            md: "31.5625rem",
          }}
          mx={"auto"}
        >
          <Text
            textStyle={{ base: "h4-semibold", lg: "h3-bold" }}
            color={"gray.900"}
            mb={".625rem"}
            textAlign={{ base: "center", lg: "left" }}
          >
            Sign In to Your Account
          </Text>
          <Text
            textStyle={"small-regular"}
            textAlign={{ base: "center", lg: "left" }}
          >
            Please enter your registered email address and password to access
            your workspace.
          </Text>

          <chakra.form
            position={"relative"}
            mt={"2.5rem"}
            onSubmit={formik.handleSubmit}
          >
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              required={true}
              disabled={loginMutation.isPending}
              error={formik.touched.email ? formik.errors.email : undefined}
              inputProps={{
                name: "email",
                value: formik.values.email,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
              leftElement={<Mail w={".875rem"} color={"gray.300"} />}
            />

            <Box mt={"1.5rem"}>
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
                  value: formik.values.password,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                }}
                leftElement={<Lock w={".75rem"} color={"gray.700"} />}
                rightElement={
                  <Box onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? (
                      <EyeIcon
                        cursor={"pointer"}
                        w={".875rem"}
                        color={"gray.700"}
                      />
                    ) : (
                      <EyeOff
                        cursor={"pointer"}
                        w={".875rem"}
                        color={"gray.700"}
                      />
                    )}
                  </Box>
                }
              />
            </Box>

            <Text
              textStyle="small-regular"
              textAlign="right"
              mt="0.75rem"
              color="primary.400"
              fontWeight="600"
            >
              <Link to={RouteConstants.auth.resetPassword.path}>
                Forgot password?
              </Link>
            </Text>

            <Button
              mt={"1.5rem"}
              width="full"
              type="submit"
              loading={loginMutation.isPending}
              loadingText="Signing in..."
              disabled={loginMutation.isPending}
            >
              Sign In
            </Button>

            <Text
              textStyle="small-regular"
              textAlign="center"
              mt="1.5rem"
              color="gray.400"
            >
              Don't have an account?{" "}
              <Text asChild color="primary.400" fontWeight="600">
                <Link to={RouteConstants.auth.signup.path}>Sign up</Link>
              </Text>
            </Text>
          </chakra.form>
        </Box>
      </Box>
    </>
  );
}
