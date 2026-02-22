import { Head } from "@/components/seo/head";
import { CustomInput } from "@/components/input";
import { EyeIcon, EyeOff, Lock, Mail } from "@/assets/custom";
import { Box, Button, Text, chakra } from "@chakra-ui/react";
import { useState } from "react";
import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import { toaster } from "@/components/ui";
import { getErrorMessage } from "@/utils/handle-error";
import { setAccessToken, setRefreshToken } from "@/utils/persistToken";
import storage from "@/utils/storage";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import * as Yup from "yup";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
      setErrors({});
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        const nextErrors: { email?: string; password?: string } = {};
        validationError.inner.forEach((item) => {
          if (item.path && !nextErrors[item.path as "email" | "password"]) {
            nextErrors[item.path as "email" | "password"] = item.message;
          }
        });
        setErrors(nextErrors);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(QUERY_PATH.auth.login, {
        email: email.trim(),
        password,
      });
      const payload = response?.data?.data;
      if (!payload?.accessToken || !payload?.refreshToken || !payload?.user) {
        throw new Error("Invalid login response");
      }

      setAccessToken(payload.accessToken, {
        unit: "SECOND",
        value: payload.expiresIn,
      });
      setRefreshToken(payload.refreshToken, {
        unit: "DAY",
        value: 14,
      });
      storage.setValue("auth_user", payload.user, {
        unit: "DAY",
        value: 14,
      });

      toaster.create({
        type: "success",
        description: "Login successful.",
      });
      navigate(RouteConstants.overview.base.path, { replace: true });
    } catch (error) {
      toaster.create({
        type: "error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text textStyle={"h3-bold"} color={"gray.900"} mb={".625rem"}>
            Sign In to Your Account
          </Text>
          <Text textStyle={"small-regular"}>
            Please enter your registered email address and password to access
            your workspace.
          </Text>

          <chakra.form
            position={"relative"}
            mt={"2.5rem"}
            onSubmit={handleSubmit}
          >
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              required={true}
              disabled={isSubmitting}
              error={errors.email}
              inputProps={{
                value: email,
                onChange: (event) => {
                  setEmail(event.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                },
              }}
              leftElement={<Mail w={".875rem"} color={"gray.300"} />}
            />

            <Box mt={"1.5rem"}>
              <CustomInput
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                required={true}
                disabled={isSubmitting}
                error={errors.password}
                inputProps={{
                  value: password,
                  onChange: (event) => {
                    setPassword(event.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  },
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

            <Button
              mt={"2.5rem"}
              width="full"
              type="submit"
              loading={isSubmitting}
              loadingText="Signing in..."
              disabled={isSubmitting}
            >
              Sign In
            </Button>
          </chakra.form>
        </Box>
      </Box>
    </>
  );
}
