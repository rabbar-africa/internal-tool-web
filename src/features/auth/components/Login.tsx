import { Head } from "@/components/seo/head";
import { CustomInput } from "@/components/input";
import { EyeIcon, EyeOff, Lock, Mail } from "@/assets/custom";
import { Box, Button, Text, chakra } from "@chakra-ui/react";
import { useState } from "react";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
              inputProps={{
                value: email,
                onChange: (event) => setEmail(event.target.value),
              }}
              leftElement={<Mail w={".875rem"} color={"gray.300"} />}
            />

            <Box mt={"1.5rem"}>
              <CustomInput
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                required={true}
                inputProps={{
                  value: password,
                  onChange: (event) => setPassword(event.target.value),
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

            <Button mt={"2.5rem"} width="full" type="submit">
              Sign In
            </Button>
          </chakra.form>
        </Box>
      </Box>
    </>
  );
}
