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
