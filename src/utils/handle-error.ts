/**
 * A 402 from the API: the plan doesn't include this, or its allowance is used
 * up. `canUpgrade` is false when no plan on sale above theirs would help.
 */
export function getPlanLock(
  error: any,
): { message: string; canUpgrade: boolean } | null {
  const { status, data } = error?.response ?? {};
  if (
    status !== 402 ||
    (data?.code !== "PLAN_LIMIT_REACHED" &&
      data?.code !== "PLAN_FEATURE_LOCKED")
  ) {
    return null;
  }
  return { message: data.message, canUpgrade: Boolean(data.canUpgrade) };
}

/**
 * A 403 from the API's PermissionsGuard: the user's roles don't allow this.
 * Other 403s (only the owner may delete the business, an inactive account)
 * carry their own message and aren't this.
 */
export function isPermissionDenied(error: any): boolean {
  const { status, data } = error?.response ?? {};
  return (
    status === 403 &&
    typeof data?.message === "string" &&
    data.message.startsWith("You do not have the required permissions")
  );
}

/** What to tell a user their role doesn't allow something. */
export const PERMISSION_DENIED_MESSAGE =
  "Your role doesn't allow this. Ask an admin on your team if you need it.";

export function getErrorMessage(error: any) {
  const response = error?.response;
  if (response) {
    const responseData = response.data;
    if (responseData) {
      if (Array.isArray(responseData.data) && responseData.data[0]?.message) {
        return responseData.data[0].message;
      }
      if (responseData.message) {
        return responseData.message;
      }
      if (responseData.detail) {
        return responseData.detail;
      }
    }
  }

  if (error?.message === "Network Error") {
    return "Please check your network";
  }

  return error?.message;
}

export function getErrorCode(error: any) {
  return error?.response?.data?.code || "Network Error";
}
