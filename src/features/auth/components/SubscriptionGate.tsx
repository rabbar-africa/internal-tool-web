import { Button, Dialog, Link, Portal, Stack, Text } from "@chakra-ui/react";
import { useLogout } from "../api";

const whatsappNumber = "2349160002836";
const whatsappMessage = encodeURIComponent(
  "Hello Rabbar Africa! I want to activate my account",
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
const adminEmail = "contact.rabbar@gmail.com";

/**
 * TEMPORARY subscription gate. Shown to authenticated users who have no
 * active subscription (none on file, or expired). The dialog is intentionally
 * non-dismissible — there is no close button and it ignores escape / outside
 * clicks — so the app stays blocked until subscription is sorted out manually.
 *
 * Remove this once the real subscription/billing flow is finalized.
 */
export function SubscriptionGate() {
  const logout = useLogout();

  return (
    <Dialog.Root
      open
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      // No-op: the dialog can never be closed from the UI.
      onOpenChange={() => {}}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="460px">
            <Dialog.Header>
              <Dialog.Title>
                <Text textStyle="large-bold" color="gray.500">
                  Subscription required
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text textStyle="small-regular" color="gray.400">
                  Your account doesn&apos;t have an active subscription, or it
                  has expired. To continue using the app, please contact the
                  admin to have your account activated.
                </Text>

                <Stack
                  gap="1"
                  bg="gray.50"
                  borderRadius="md"
                  p="4"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  {/* TODO: re-enable payment instructions once subscription/billing is finalized.
                  <Text textStyle="tiny-semibold" color="gray.300">
                    How to subscribe
                  </Text>
                  <Text textStyle="small-regular" color="gray.500">
                    Pay{" "}
                    <Text as="span" fontWeight="700">
                      ₦5,000
                    </Text>{" "}
                    into the company account, then contact the admin to have
                    your subscription activated.
                  </Text>
                  */}
                  <Text textStyle="small-regular" color="gray.500">
                    Contact the admin by clicking the link below to activate
                    your account.
                  </Text>
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary.500"
                    fontWeight="600"
                    textStyle="small-regular"
                    mt="1"
                  >
                    Click here to contact admin →
                  </Link>
                  <Text textStyle="small-regular" color="gray.400" mt="1">
                    Or email us at{" "}
                    <Link
                      href={`mailto:${adminEmail}`}
                      color="primary.500"
                      fontWeight="600"
                    >
                      {adminEmail}
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
