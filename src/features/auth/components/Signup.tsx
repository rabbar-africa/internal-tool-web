import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { Link, useSearchParams } from "react-router-dom";
import { Head } from "@/components/seo/head";
import { billingService } from "@/features/billing/api/service";
import { RouteConstants } from "@/shared/constants/routes";
import { readSignupPlan, signupPlanName } from "../utils/signup-plan";
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
  // The paid plan picked on the landing page, if any. The URL keeps it
  // through every step, a reload included.
  const [searchParams] = useSearchParams();
  const plan = useMemo(() => readSignupPlan(searchParams), [searchParams]);
  const [openingPayment, setOpeningPayment] = useState(false);
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

  // Hard redirects, so ProtectedRoutes re-reads the (now verified) user.
  const finish = async () => {
    if (!plan) {
      window.location.replace(RouteConstants.overview.base.path);
      return;
    }
    // Straight on to pay for the plan they picked. Paystack sends them back
    // to the billing page, which shows how the payment went.
    setOpeningPayment(true);
    try {
      const result = await billingService.checkout(plan);
      if (result.status === "redirect") {
        window.location.assign(result.authorizationUrl);
      } else {
        // A promo covered it: the plan is already active.
        window.location.replace(RouteConstants.overview.base.path);
      }
    } catch {
      // The account is ready either way: let them pay from the billing page,
      // with the plan already picked.
      window.location.replace(
        RouteConstants.settings.billing.generate(
          {},
          {
            planTier: plan.planTier,
            billingInterval: plan.billingInterval,
          },
        ),
      );
    }
  };

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
          Set up your business
        </Text>
        <Text mt="0.625rem" fontSize="0.9375rem" color="gray.300">
          Two minutes to get going. Bank and address details are optional and
          can be added later.
        </Text>
        {plan && (
          <Box
            mt="4"
            px="4"
            py="3"
            rounded="lg"
            bg="secondary.50"
            borderWidth="1px"
            borderColor="secondary.100"
          >
            <Text fontSize="0.875rem" color="gray.500">
              <Text as="span" fontWeight="700">
                {signupPlanName(plan)} plan,{" "}
                {plan.billingInterval === "ANNUAL"
                  ? "paid yearly"
                  : "paid monthly"}
                .
              </Text>{" "}
              Once your account is set up, we&rsquo;ll take you to pay for it.
            </Text>
          </Box>
        )}

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
          {step === 4 &&
            (openingPayment ? (
              <Center flexDirection="column" gap="3" py="10">
                <Spinner color="primary.300" />
                <Text fontSize="0.875rem" color="gray.400">
                  Taking you to payment…
                </Text>
              </Center>
            ) : (
              <AddressStep
                onCompleted={() => void finish()}
                onSkip={() => void finish()}
              />
            ))}
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
