import { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Head } from "@/components/seo/head";
import { RouteConstants } from "@/shared/constants/routes";
import { SignupStepper } from "./signup/SignupStepper";
import { OrganizationStep } from "./signup/OrganizationStep";
import { VerifyEmailStep } from "./signup/VerifyEmailStep";
import { BankAccountStep } from "./signup/BankAccountStep";
import { AddressStep } from "./signup/AddressStep";

const STEPS = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Verify Email" },
  { id: 3, label: "Bank Account" },
  { id: 4, label: "Address" },
];

export function Signup() {
  const [step, setStep] = useState(1);
  const [ownerEmail, setOwnerEmail] = useState("");

  // Hard redirect so ProtectedRoutes re-reads the (now verified) user.
  const finish = () =>
    window.location.replace(RouteConstants.overview.base.path);

  return (
    <>
      <Head title="Sign Up" description="Create your organization account" />

      <Box
        w={{ base: "100%", md: "45.5625rem" }}
        bg="white"
        p={{ base: "1.5rem", md: "3rem" }}
        borderRadius="lg"
        boxShadow="lg"
        maxH="92vh"
        overflowY="auto"
      >
        <Box w={{ base: "100%", md: "34rem" }} mx="auto">
          <Text
            textStyle={{ base: "h4-semibold", lg: "h3-bold" }}
            color="gray.900"
            mb=".5rem"
            textAlign={{ base: "center", lg: "left" }}
          >
            Create your account
          </Text>
          <Text
            textStyle="small-regular"
            textAlign={{ base: "center", lg: "left" }}
          >
            Set up your organization to get started. Bank and address details
            are optional and can be added later.
          </Text>

          <Box mt="2rem">
            <SignupStepper steps={STEPS} current={step} />
          </Box>

          <Box mt="2rem">
            {step === 1 && (
              <OrganizationStep
                onCompleted={(email) => {
                  setOwnerEmail(email);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <VerifyEmailStep
                email={ownerEmail}
                onCompleted={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <BankAccountStep
                onCompleted={() => setStep(4)}
                onSkip={() => setStep(4)}
              />
            )}
            {step === 4 && <AddressStep onCompleted={finish} onSkip={finish} />}
          </Box>

          {step === 1 && (
            <Text
              textStyle="small-regular"
              textAlign="center"
              mt="1.5rem"
              color="gray.400"
            >
              Already have an account?{" "}
              <Text color="primary.400" fontWeight="600" asChild>
                {" "}
                <Link to={RouteConstants.auth.login.path}>Sign in</Link>
              </Text>
            </Text>
          )}
        </Box>
      </Box>
    </>
  );
}
