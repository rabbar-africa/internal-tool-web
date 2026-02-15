export const QUERY_PATH = {
  auth: {
    login: "auth/login",
    otpLogin: "auth/login/otp",
    getOtp: "auth/login/otp",
    passwordResetRequest: "auth/password-reset/request",
    passwordResetConfirm: "auth/password-reset/confirm",
    refreshToken: "auth/refresh-tokens",
    getCurrentUser: "user/logged-in",
    getUserOrganization: "/organizations",
  },
  users: {
    getAccountUsers: "accounts/users",
    getAdminUsers: "admin/users",
  },
};
