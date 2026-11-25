import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useBlocker } from "react-router-dom";

/**
 * "Leave this invoice?" for create forms: going back, following a link or
 * pressing Cancel with unsaved changes asks first, offering Keep editing,
 * Discard, or (where the record can be a draft) Leave & save as draft.
 * Reloading or closing the tab gets the browser's own warning.
 *
 *   const guard = useLeaveGuard({ when: formik.dirty, onSaveDraft });
 *   … on a successful save, before navigating: guard.release();
 *   <LeaveGuardDialog guard={guard} record="invoice" />
 */

interface LeaveGuardOptions {
  /** Unsaved changes worth asking about. */
  when: boolean;
  /**
   * Saves the form as a draft; resolves true when saved, false to stay (the
   * form shows why, e.g. a missing customer). Leave out where the record
   * can't be a draft.
   */
  onSaveDraft?: () => Promise<boolean>;
}

export function useLeaveGuard({ when, onSaveDraft }: LeaveGuardOptions) {
  // Set once the form has saved and is leaving on purpose.
  const released = useRef(false);
  const whenRef = useRef(when);
  whenRef.current = when;

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        !released.current &&
        whenRef.current &&
        // Only leaving the page, not a change of its own query or hash.
        currentLocation.pathname !== nextLocation.pathname,
      [],
    ),
  );

  // Reload, close the tab, type another address: the browser asks.
  useEffect(() => {
    if (!when) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (released.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [when]);

  const [saving, setSaving] = useState(false);

  /** Lets the next navigation through: call it once the record is saved. */
  const release = useCallback(() => {
    released.current = true;
  }, []);

  const keepEditing = () => {
    if (blocker.state === "blocked") blocker.reset();
  };
  const discard = () => {
    released.current = true;
    if (blocker.state === "blocked") blocker.proceed();
  };
  const saveDraft = async () => {
    if (!onSaveDraft || blocker.state !== "blocked") return;
    setSaving(true);
    try {
      const saved = await onSaveDraft();
      if (saved) {
        released.current = true;
        blocker.proceed();
      } else {
        // Something needs filling in first: back to the form to see it.
        blocker.reset();
      }
    } catch {
      // The save failed (the error toasts globally): stay on the form.
      blocker.reset();
    } finally {
      setSaving(false);
    }
  };

  return {
    open: blocker.state === "blocked",
    canSaveDraft: Boolean(onSaveDraft),
    saving,
    release,
    keepEditing,
    discard,
    saveDraft,
  };
}

export type LeaveGuard = ReturnType<typeof useLeaveGuard>;

interface LeaveGuardDialogProps {
  guard: LeaveGuard;
  /** "invoice", "job card", … */
  record: string;
  /** Overrides "Leave this {record}?", e.g. for several at once. */
  title?: string;
  /** Where its drafts are found, e.g. "Invoices → Drafts". */
  draftsWhere?: string;
  /**
   * What a draft doesn't do yet, as a clause after the dash, e.g. "it won't
   * count toward your sales until you issue it".
   */
  draftNote?: string;
}

export function LeaveGuardDialog({
  guard,
  record,
  title,
  draftsWhere,
  draftNote,
}: LeaveGuardDialogProps) {
  const body = guard.canSaveDraft
    ? [
        `Your changes will be saved as a draft${
          draftNote ? ` - ${draftNote}` : ""
        }.`,
        draftsWhere ? `Pick it up later from ${draftsWhere}.` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : `What you've entered hasn't been saved. Leave now and it will be lost.`;

  return (
    <Dialog.Root
      open={guard.open}
      onOpenChange={({ open }) => {
        if (!open && !guard.saving) guard.keepEditing();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="34rem" mx="4" rounded="2xl">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" py="5">
              <Dialog.Title>
                <Text fontSize="20px" fontWeight="600" color="black">
                  {title ?? `Leave this ${record}?`}
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild top="4" right="4">
              <CloseButton size="sm" disabled={guard.saving} />
            </Dialog.CloseTrigger>
            <Dialog.Body py="5">
              <Text fontSize="15px" color="gray.500" lineHeight="1.6">
                {body}
              </Text>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" py="4">
              <Flex
                gap="3"
                justify="flex-end"
                w="100%"
                direction={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  variant="outline"
                  color="black"
                  borderColor="gray.200"
                  onClick={guard.keepEditing}
                  disabled={guard.saving}
                >
                  Keep editing
                </Button>
                <Button
                  variant="outline"
                  color="red.500"
                  borderColor="gray.200"
                  onClick={guard.discard}
                  disabled={guard.saving}
                >
                  Discard
                </Button>
                {guard.canSaveDraft && (
                  <Button
                    variant="accent"
                    onClick={() => void guard.saveDraft()}
                    loading={guard.saving}
                    loadingText="Saving draft..."
                  >
                    Leave & save as draft
                  </Button>
                )}
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
