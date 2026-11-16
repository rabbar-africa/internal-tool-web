import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { forgetRecord, isDeleted } from "@/lib/react-query/deleted-records";
import { stepsBackPast } from "@/utils/history-trail";

/**
 * For a page that deletes the record it shows. `leave()` goes back to where
 * the person came from, past every page of that record (its detail and edit
 * pages), so Back can't land on it again; with nowhere known to go back to,
 * it replaces this page with `fallbackPath`. Once the page has closed, the
 * record's cached copies go too. The delete's own refresh already leaves it
 * alone (see `meta.deletes`).
 */
export function useLeaveDeletedRecord(id: string, fallbackPath: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(
    () => () => {
      if (id && isDeleted(id)) forgetRecord(queryClient, id);
    },
    [id, queryClient],
  );

  return useCallback(() => {
    const steps = stepsBackPast((path) => path.includes(id));
    if (steps) navigate(-steps);
    else navigate(fallbackPath, { replace: true });
  }, [id, fallbackPath, navigate]);
}
