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
