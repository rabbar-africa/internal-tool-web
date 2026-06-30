export const QUERY_PATH = {
  auth: {
    login: "auth/login",
    otpLogin: "auth/login/otp",
    getOtp: "auth/login/otp",
    passwordResetRequest: "auth/password-reset/request",
    passwordResetConfirm: "auth/password-reset/confirm",
    refreshToken: "auth/refresh-token",
    getCurrentUser: "auth/me",
    getUserOrganization: "/organizations",
    register: "organizations/register",
    verifyEmail: "auth/verify-email",
    resendVerification: "auth/resend-verification",
  },
  users: {
    getAccountUsers: "accounts/users",
    getAdminUsers: "admin/users",
  },
};
