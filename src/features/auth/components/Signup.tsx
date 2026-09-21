import { useEffect, useRef, useState } from "react";
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
  { id: 1, label: "Company" },
  { id: 2, label: "Verify Email" },
  { id: 3, label: "Bank Account" },
  { id: 4, label: "Address" },
];

export function Signup() {
  const [step, setStep] = useState(1);
  const [ownerEmail, setOwnerEmail] = useState("");
  const stepperRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(step);

  // Bring the stepper back into view when the step changes. Without this,
  // tapping Continue at the bottom of the long first step lands the user
  // mid-way down the next one with no sight of their progress. Compares
  // against the previous step (not a first-render flag) so StrictMode's
  // double-run on mount doesn't scroll the page.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;

    const el = stepperRef.current;
    if (!el) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top >= 0 && bottom <= window.innerHeight) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [step]);

  // Hard redirect so ProtectedRoutes re-reads the (now verified) user.
  const finish = () =>
    window.location.replace(RouteConstants.overview.base.path);

  return (
    <>
      <Head title="Sign Up" description="Create your company account" />

      <Box w="100%" maxW="32rem">
        <Text
          fontSize="1.75rem"
          lineHeight="1.2"
          fontWeight="700"
          letterSpacing="-0.02em"
          color="primary.500"
        >
          Set up your workshop
        </Text>
        <Text mt="0.625rem" fontSize="0.9375rem" color="gray.300">
          Two minutes to get going. Bank and address details are optional and
          can be added later.
        </Text>

        <Box ref={stepperRef} mt="2rem" scrollMarginTop="1.25rem">
          <SignupStepper steps={STEPS} current={step} />
        </Box>

        {/* Keyed on the step so each one remounts and eases in. */}
        <Box
          key={step}
          mt="2rem"
          animation="stepIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both"
          _motionReduce={{ animation: "none" }}
        >
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
            fontSize="0.875rem"
            textAlign="center"
            mt="1.75rem"
            color="gray.300"
          >
            Already have an account?{" "}
            <Text color="primary.300" fontWeight="600" asChild>
              <Link to={RouteConstants.auth.login.path}>Sign in</Link>
            </Text>
          </Text>
        )}
      </Box>
    </>
  );
}
